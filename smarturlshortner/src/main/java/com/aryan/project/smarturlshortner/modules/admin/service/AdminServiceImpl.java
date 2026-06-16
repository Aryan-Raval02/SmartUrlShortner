package com.aryan.project.smarturlshortner.modules.admin.service;

import com.aryan.project.smarturlshortner.modules.admin.dto.*;
import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.modules.auth.repository.UserRepository;
import com.aryan.project.smarturlshortner.modules.auth.repository.UserSessionRepository;
import com.aryan.project.smarturlshortner.modules.auth.service.AuthServiceImpl;
import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import com.aryan.project.smarturlshortner.modules.url.service.UrlServiceImpl;
import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final UrlRepository urlRepository;
    private final AuthServiceImpl authService;
    private final UrlServiceImpl urlService;

    // M1: List all users
    public Page<AdminUserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toAdminUserResponse);
    }

    // M2: Get user detail
    public AdminUserResponse getUserDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return toAdminUserResponse(user);
    }

    // M3: Toggle block/unblock user
    @Transactional
    public AdminUserResponse toggleBlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if ("BLOCKED".equals(user.getStatus())) {
            user.setStatus("ACTIVE");
        } else {
            user.setStatus("BLOCKED");
            // Auto-disable all their URLs
            urlRepository.disableAllUrlsByUserId(id);
            sessionRepository.deactivateAllByUserId(id);
        }
        return toAdminUserResponse(userRepository.save(user));
    }

    // M4: Change user role
    @Transactional
    public AdminUserResponse changeUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        user.setRole(role.toUpperCase());
        return toAdminUserResponse(userRepository.save(user));
    }

    // M5: Hard delete user
    @Transactional
    public void hardDeleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new ResourceNotFoundException("User not found.");
        userRepository.deleteById(id);
    }

    // M6: Bulk block users
    @Transactional
    public void bulkBlockUsers(List<Long> ids) {
        ids.forEach(id -> {
            userRepository.findById(id).ifPresent(user -> {
                user.setStatus("BLOCKED");
                userRepository.save(user);
                urlRepository.disableAllUrlsByUserId(id);
            });
        });
    }

    // M7: List all URLs
    public Page<AdminUrlResponse> listAllUrls(Pageable pageable) {
        return urlRepository.findByDeletedFalse(pageable).map(this::toAdminUrlResponse);
    }

    // M8: Toggle disable/enable URL
    @Transactional
    public AdminUrlResponse toggleDisableUrl(Long id) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        url.setActive(!url.isActive());
        return toAdminUrlResponse(urlRepository.save(url));
    }

    // M9: Hard delete URL
    @Transactional
    public void hardDeleteUrl(Long id) {
        if (!urlRepository.existsById(id)) throw new ResourceNotFoundException("URL not found.");
        urlRepository.deleteById(id);
    }

    // M10: Bulk delete URLs
    @Transactional
    public void bulkDeleteUrls(List<Long> ids) {
        urlRepository.deleteAllById(ids);
    }

    // M11: Bulk disable URLs
    @Transactional
    public void bulkDisableUrls(List<Long> ids) {
        ids.forEach(id -> urlRepository.findById(id).ifPresent(url -> {
            url.setActive(false);
            urlRepository.save(url);
        }));
    }

    // M12: Platform dashboard
    public PlatformStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalUrls = urlRepository.countTotalActiveUrls();
        Long totalClicks = urlRepository.sumTotalClicks();
        return PlatformStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalUrls(totalUrls)
                .totalClicks(totalClicks != null ? totalClicks : 0L)
                .build();
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminUrlResponse toAdminUrlResponse(Url url) {
        return AdminUrlResponse.builder()
                .id(url.getId())
                .shortCode(url.getShortCode())
                .originalUrl(url.getOriginalUrl())
                .userId(url.getUserId())
                .active(url.isActive())
                .suspicious(url.isSuspicious())
                .totalClicks(url.getTotalClicks())
                .createdAt(url.getCreatedAt())
                .build();
    }
}
