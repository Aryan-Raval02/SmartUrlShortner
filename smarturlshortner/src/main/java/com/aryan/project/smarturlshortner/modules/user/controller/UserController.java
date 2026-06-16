package com.aryan.project.smarturlshortner.modules.user.controller;

import com.aryan.project.smarturlshortner.modules.auth.dto.UserResponse;
import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.modules.user.dto.ChangePasswordRequest;
import com.aryan.project.smarturlshortner.modules.user.dto.SessionResponse;
import com.aryan.project.smarturlshortner.modules.user.dto.UpdateProfileRequest;
import com.aryan.project.smarturlshortner.modules.user.service.UserServiceImpl;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Profile management, sessions, avatar, password change")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserServiceImpl userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ResponseStructure<UserResponse>> getProfile(
            @AuthenticationPrincipal User user) {
        return ResponseBuilder.success(HttpStatus.OK, "Profile retrieved", userService.getProfile(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile")
    public ResponseEntity<ResponseStructure<UserResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseBuilder.success(HttpStatus.OK, "Profile updated successfully", userService.updateProfile(user, request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ResponseStructure<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user, request);
        return ResponseBuilder.success(HttpStatus.OK, "Password changed successfully", null);
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload profile avatar")
    public ResponseEntity<ResponseStructure<Map<String, String>>> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("avatar") MultipartFile file) throws IOException {
        String url = userService.uploadAvatar(user, file);
        return ResponseBuilder.success(HttpStatus.OK, "Avatar uploaded successfully", Map.of("avatarUrl", url));
    }

    @GetMapping("/me/sessions")
    @Operation(summary = "List active sessions")
    public ResponseEntity<ResponseStructure<List<SessionResponse>>> getSessions(
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        // Attempt to extract refresh token from request if provided
        String refreshToken = request.getHeader("X-Refresh-Token");
        return ResponseBuilder.success(HttpStatus.OK, "Sessions retrieved", userService.getSessions(user, refreshToken));
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    @Operation(summary = "Revoke a specific session")
    public ResponseEntity<ResponseStructure<Void>> revokeSession(
            @AuthenticationPrincipal User user,
            @PathVariable Long sessionId) {
        userService.revokeSession(user, sessionId);
        return ResponseBuilder.success(HttpStatus.OK, "Session revoked", null);
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete account (soft delete)")
    public ResponseEntity<ResponseStructure<Void>> deleteAccount(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        userService.deleteAccount(user, body.get("password"));
        return ResponseBuilder.success(HttpStatus.OK, "Account scheduled for deletion", null);
    }
}
