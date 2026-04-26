package com.aryan.project.smarturlshortner.modules.url.service;

import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final Base62Service base62Service;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    @Override
    public UrlResponse createShortUrl(CreateUrlRequest request, Long userId) {
        // 1. Handle Custom Alias
        String shortCode;
        if (request.getCustomAlias() != null && !request.getCustomAlias().isBlank()) {
            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new ResourceNotFoundException("Alias already taken !!");
            }
            shortCode = request.getCustomAlias();
        } else {
            // Placeholder: Save first to get ID, then update shortCode
            Url initialUrl = Url.builder()
                    .originalUrl(request.getOriginalUrl())
                    .userId(userId)
                    .title(request.getTitle())
                    .expiryDate(request.getExpiryDate())
                    .shortCode("TEMP_" + System.nanoTime())
                    .build();
            Url savedUrl = urlRepository.save(initialUrl);
            shortCode = base62Service.encode(savedUrl.getId());
            savedUrl.setShortCode(shortCode);
            urlRepository.save(savedUrl);
        }

        Url url = urlRepository.findByShortCode(shortCode).orElseThrow();

        return mapToResponse(url);
    }

    @Transactional(readOnly = true)
    @Override
    public UrlResponse getUrlByShortCode(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found !!"));
        
        if (!url.isActive() || url.isDeleted()) {
            throw new IllegalArgumentException("URL is inactive or deleted !!");
        }
        
        return mapToResponse(url);
    }

    private UrlResponse mapToResponse(Url url) {
        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(baseUrl + "/" + url.getShortCode())
                .title(url.getTitle())
                .active(url.isActive())
                .passwordProtected(url.getPasswordHash() != null)
                .expiryDate(url.getExpiryDate())
                .totalClicks(url.getTotalClicks())
                .uniqueClicks(url.getUniqueClicks())
                .createdAt(url.getCreatedAt())
                .build();
    }
}
