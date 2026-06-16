package com.aryan.project.smarturlshortner.modules.auth.controller;

import com.aryan.project.smarturlshortner.modules.auth.dto.*;
import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.modules.auth.service.AuthService;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, token management, password reset, email verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ResponseStructure<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        UserResponse user = authService.register(request, deviceInfo, ip);
        return ResponseBuilder.success(HttpStatus.CREATED, "Registration successful. Please verify your email.", user);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<ResponseStructure<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        TokenResponse tokens = authService.login(request, deviceInfo, ip);
        return ResponseBuilder.success(HttpStatus.OK, "Login successful", tokens);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ResponseStructure<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokens = authService.refreshToken(request);
        return ResponseBuilder.success(HttpStatus.OK, "Token refreshed successfully", tokens);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — invalidate current session")
    public ResponseEntity<ResponseStructure<Void>> logout(
            @Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseBuilder.success(HttpStatus.OK, "Logged out successfully", null);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ResponseStructure<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseBuilder.success(HttpStatus.OK, "If an account with that email exists, a reset link has been sent.", null);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token from email")
    public ResponseEntity<ResponseStructure<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseBuilder.success(HttpStatus.OK, "Password reset successfully. Please log in.", null);
    }

    @PostMapping("/verify-email/resend")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ResponseStructure<Void>> resendVerification(
            @AuthenticationPrincipal User currentUser) {
        authService.resendVerificationEmail(currentUser.getId());
        return ResponseBuilder.success(HttpStatus.OK, "Verification email sent.", null);
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address via token")
    public ResponseEntity<ResponseStructure<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseBuilder.success(HttpStatus.OK, "Email verified successfully.", null);
    }
}
