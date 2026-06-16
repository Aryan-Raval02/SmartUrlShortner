package com.aryan.project.smarturlshortner.modules.user.service;

import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.exception.UnauthorizedException;
import com.aryan.project.smarturlshortner.modules.auth.dto.UserResponse;
import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.modules.auth.entity.UserSession;
import com.aryan.project.smarturlshortner.modules.auth.repository.UserRepository;
import com.aryan.project.smarturlshortner.modules.auth.repository.UserSessionRepository;
import com.aryan.project.smarturlshortner.modules.auth.service.AuthServiceImpl;
import com.aryan.project.smarturlshortner.modules.user.dto.ChangePasswordRequest;
import com.aryan.project.smarturlshortner.modules.user.dto.SessionResponse;
import com.aryan.project.smarturlshortner.modules.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthServiceImpl authService; // reuse mapToUserResponse

    @Value("${app.avatar-upload-dir:uploads/avatars/}")
    private String avatarUploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // P1: Get current user profile
    @Transactional(readOnly = true)
    public UserResponse getProfile(User user) {
        return authService.mapToUserResponse(user);
    }

    // P2: Update profile
    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest request) {
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), user.getId())) {
                throw new RuntimeException("Username already taken.");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        return authService.mapToUserResponse(userRepository.save(user));
    }

    // P3: Change password
    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as the current password.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        // Invalidate all other sessions
        sessionRepository.deactivateAllByUserId(user.getId());
    }

    // P4: Upload avatar
    @Transactional
    public String uploadAvatar(User user, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty.");
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.contains("jpeg") && !contentType.contains("png") && !contentType.contains("webp"))) {
            throw new IllegalArgumentException("Only JPEG, PNG and WebP files are supported.");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be under 2MB.");
        }

        Path uploadPath = Paths.get(avatarUploadDir);
        Files.createDirectories(uploadPath);

        String fileName = user.getId() + "_" + UUID.randomUUID() + getExtension(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());

        String avatarUrl = baseUrl + "/avatars/" + fileName;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    // P5: Get active sessions
    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions(User user, String currentRefreshToken) {
        return sessionRepository.findAllByUserIdAndIsActiveTrue(user.getId()).stream()
                .map(s -> SessionResponse.builder()
                        .id(s.getId())
                        .deviceInfo(s.getDeviceInfo())
                        .ipAddress(maskIp(s.getIpAddress()))
                        .location(s.getLocation())
                        .isCurrent(s.getRefreshToken().equals(currentRefreshToken))
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // P6: Revoke a session
    @Transactional
    public void revokeSession(User user, Long sessionId) {
        UserSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found."));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Session does not belong to current user.");
        }
        session.setActive(false);
        sessionRepository.save(session);
    }

    // P7: Delete account (soft delete)
    @Transactional
    public void deleteAccount(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Password is incorrect.");
        }
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setStatus("DELETED");
        userRepository.save(user);
        sessionRepository.deactivateAllByUserId(user.getId());
    }

    private String maskIp(String ip) {
        if (ip == null) return null;
        int lastDot = ip.lastIndexOf('.');
        return lastDot > 0 ? ip.substring(0, lastDot) + ".***" : ip;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}
