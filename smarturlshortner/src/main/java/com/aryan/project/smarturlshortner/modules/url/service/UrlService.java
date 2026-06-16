package com.aryan.project.smarturlshortner.modules.url.service;

import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.request.UpdateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.AliasCheckResponse;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UrlService {
    UrlResponse createShortUrl(CreateUrlRequest request, Long userId, String ipAddress);
    Page<UrlResponse> getUserUrls(Long userId, String search, String status, Pageable pageable);
    UrlResponse getUrlById(Long id, Long userId, boolean isAdmin);
    UrlResponse updateUrl(Long id, Long userId, boolean isAdmin, UpdateUrlRequest request);
    void deleteUrl(Long id, Long userId, boolean isAdmin);
    AliasCheckResponse checkAlias(String alias);
    byte[] generateQrCode(Long id, Long userId, boolean isAdmin);
    UrlResponse getUrlByShortCode(String shortCode); // for redirect
}
