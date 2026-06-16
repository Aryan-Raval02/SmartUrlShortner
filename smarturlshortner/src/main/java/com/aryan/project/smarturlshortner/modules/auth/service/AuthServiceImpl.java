package com.aryan.project.smarturlshortner.modules.auth.service;

import com.aryan.project.smarturlshortner.exception.ResourceFoundException;
import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.exception.UnauthorizedException;
import com.aryan.project.smarturlshortner.modules.auth.dto.*;
import com.aryan.project.smarturlshortner.modules.auth.entity.*;
import com.aryan.project.smarturlshortner.modules.auth.repository.*;
import com.aryan.project.smarturlshortner.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final EmailVerificationTokenRepository emailTokenRepo;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.mail-from}")
    private String mailFrom;

    @Value("${app.brute-force.max-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.brute-force.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    // ─── A1: Register ────────────────────────────────────────────────────────
    @Override
    @Transactional
    public UserResponse register(RegisterRequest request, String deviceInfo, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceFoundException("Email already registered.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceFoundException("Username already taken.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .status("ACTIVE")
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        sendVerificationEmail(user);
        return mapToUserResponse(user);
    }

    // ─── A2: Login ───────────────────────────────────────────────────────────
    @Override
    @Transactional
    public TokenResponse login(LoginRequest request, String deviceInfo, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        // Check account status
        if ("BLOCKED".equals(user.getStatus())) {
            throw new UnauthorizedException("Your account has been blocked. Contact support.");
        }
        if ("DELETED".equals(user.getStatus()) || user.isDeleted()) {
            throw new UnauthorizedException("Account not found.");
        }

        // Check brute-force lock
        if (user.getLockExpiresAt() != null && user.getLockExpiresAt().isAfter(LocalDateTime.now())) {
            long secondsLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockExpiresAt()).getSeconds();
            throw new UnauthorizedException("Account locked. Try again in " + secondsLeft + " seconds.");
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxFailedAttempts) {
                user.setLockExpiresAt(LocalDateTime.now().plusMinutes(lockDurationMinutes));
                user.setFailedLoginAttempts(0);
            }
            userRepository.save(user);
            throw new UnauthorizedException("Invalid email or password.");
        }

        // Reset brute-force counters on success
        user.setFailedLoginAttempts(0);
        user.setLockExpiresAt(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        // Create session
        UserSession session = UserSession.builder()
                .user(user)
                .refreshToken(refreshToken)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .isActive(true)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpirySeconds()))
                .build();
        sessionRepository.save(session);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .accessTokenExpiry(900L)
                .refreshTokenExpiry(jwtTokenProvider.getRefreshTokenExpirySeconds())
                .user(mapToUserResponse(user))
                .build();
    }

    // ─── A3: Refresh Token ───────────────────────────────────────────────────
    @Override
    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        UserSession session = sessionRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token."));

        if (!session.isActive() || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired or been revoked.");
        }

        User user = session.getUser();

        // Rotate: invalidate old, create new
        session.setActive(false);
        sessionRepository.save(session);

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken();

        UserSession newSession = UserSession.builder()
                .user(user)
                .refreshToken(newRefreshToken)
                .deviceInfo(session.getDeviceInfo())
                .ipAddress(session.getIpAddress())
                .isActive(true)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpirySeconds()))
                .build();
        sessionRepository.save(newSession);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .accessTokenExpiry(900L)
                .refreshTokenExpiry(jwtTokenProvider.getRefreshTokenExpirySeconds())
                .user(mapToUserResponse(user))
                .build();
    }

    // ─── A4: Logout ──────────────────────────────────────────────────────────
    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        sessionRepository.findByRefreshToken(request.getRefreshToken())
                .ifPresent(session -> {
                    session.setActive(false);
                    sessionRepository.save(session);
                });
    }

    // ─── A5: Forgot Password ─────────────────────────────────────────────────
    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return 200 to prevent email enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            resetTokenRepo.invalidatePreviousTokens(user.getId());
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(LocalDateTime.now().plusMinutes(30))
                    .build();
            resetTokenRepo.save(resetToken);
            sendPasswordResetEmail(user, token);
        });
    }

    // ─── A6: Reset Password ──────────────────────────────────────────────────
    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        PasswordResetToken resetToken = resetTokenRepo.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired or already been used.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepo.save(resetToken);

        // Invalidate all sessions for security
        sessionRepository.deactivateAllByUserId(user.getId());
    }

    // ─── A7: Resend Verification Email ───────────────────────────────────────
    @Override
    @Transactional
    public void resendVerificationEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified.");
        }

        emailTokenRepo.invalidatePreviousTokens(userId);
        sendVerificationEmail(user);
    }

    // ─── A8: Verify Email ────────────────────────────────────────────────────
    @Override
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailTokenRepo.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token."));

        if (verificationToken.isUsed() || verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired or already been used.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailTokenRepo.save(verificationToken);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void sendVerificationEmail(User user) {
        emailTokenRepo.invalidatePreviousTokens(user.getId());
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        emailTokenRepo.save(verificationToken);

        String link = frontendUrl + "/verify-email?token=" + token;
        sendEmail(user.getEmail(), "Verify your Shortly account",
                "Hi " + user.getFullName() + ",\n\nPlease verify your email address by clicking the link below:\n\n"
                + link + "\n\nThis link expires in 24 hours.\n\nTeam Shortly");
    }

    private void sendPasswordResetEmail(User user, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        sendEmail(user.getEmail(), "Reset your Shortly password",
                "Hi " + user.getFullName() + ",\n\nClick the link below to reset your password:\n\n"
                + link + "\n\nThis link expires in 30 minutes.\n\nTeam Shortly");
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
