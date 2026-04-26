package com.aryan.project.smarturlshortner.modules.url.service;

import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import org.springframework.transaction.annotation.Transactional;

public interface UrlService {
    @Transactional
    UrlResponse createShortUrl(CreateUrlRequest request, Long userId);

    @Transactional(readOnly = true)
    UrlResponse getUrlByShortCode(String shortCode);
}
