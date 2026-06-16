package com.aryan.project.smarturlshortner.modules.auth.service;

import com.aryan.project.smarturlshortner.modules.auth.dto.*;

public interface AuthService {
    UserResponse register(RegisterRequest request, String deviceInfo, String ipAddress);
    TokenResponse login(LoginRequest request, String deviceInfo, String ipAddress);
    TokenResponse refreshToken(RefreshTokenRequest request);
    void logout(LogoutRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void resendVerificationEmail(Long userId);
    void verifyEmail(String token);
}
