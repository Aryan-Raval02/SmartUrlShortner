package com.aryan.project.smarturlshortner.modules.url.service;

import com.aryan.project.smarturlshortner.exception.AliasAlreadyTakenException;
import com.aryan.project.smarturlshortner.exception.RateLimitExceededException;
import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.exception.UnauthorizedException;
import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.request.UpdateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.AliasCheckResponse;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final Base62Service base62Service;
    private final RedisTemplate<String, Object> redisTemplate;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.rate-limit.guest-daily-limit:5}")
    private int guestDailyLimit;

    private static final String REDIS_URL_PREFIX = "url:shortcode:";
    private static final String REDIS_RATE_PREFIX = "ratelimit:guest:";
    private static final List<String> RESERVED_WORDS = Arrays.asList(
            "api", "admin", "login", "register", "dashboard", "urls", "error",
            "public", "verify-email", "reset-password", "forgot-password", "profile", "unlock"
    );

    // ─── U1: Create Short URL ─────────────────────────────────────────────────
    @Override
    @Transactional
    public UrlResponse createShortUrl(CreateUrlRequest request, Long userId, String ipAddress) {
        // Guest rate limiting
        if (userId == null) {
            checkGuestRateLimit(ipAddress);
        }

        // Handle alias
        String shortCode;
        if (request.getCustomAlias() != null && !request.getCustomAlias().isBlank()) {
            String alias = request.getCustomAlias().toLowerCase();
            if (RESERVED_WORDS.contains(alias)) {
                throw new AliasAlreadyTakenException(alias);
            }
            if (urlRepository.existsByShortCode(alias)) {
                throw new AliasAlreadyTakenException(alias);
            }
            shortCode = alias;
        } else {
            // Save a placeholder first to get the DB-generated ID for Base62 encoding
            Url placeholder = Url.builder()
                    .originalUrl(request.getOriginalUrl())
                    .userId(userId)
                    .title(request.getTitle())
                    .expiryDate(request.getExpiryDate())
                    .shortCode("__temp__" + System.nanoTime())
                    .active(true)
                    .build();
            placeholder = urlRepository.save(placeholder);
            shortCode = base62Service.encode(placeholder.getId());
            // Ensure min 6 chars
            if (shortCode.length() < 6) shortCode = String.format("%06d", placeholder.getId());
            placeholder.setShortCode(shortCode);

            // Handle password
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                placeholder.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            }
            Url saved = urlRepository.save(placeholder);
            cacheUrl(saved);
            return mapToResponse(saved);
        }

        // Custom alias path
        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .userId(userId)
                .title(request.getTitle())
                .expiryDate(request.getExpiryDate())
                .shortCode(shortCode)
                .active(true)
                .deleted(false)
                .totalClicks(0L)
                .uniqueClicks(0L)
                .build();

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            url.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        Url saved = urlRepository.save(url);
        cacheUrl(saved);

        // Increment guest rate limit counter
        if (userId == null) incrementGuestCounter(ipAddress);

        return mapToResponse(saved);
    }

    // ─── U2: List User's URLs ─────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public Page<UrlResponse> getUserUrls(Long userId, String search, String status, Pageable pageable) {
        // Simplified: filter by userId and deleted=false, apply search in memory for now
        return urlRepository.findByUserIdAndDeletedFalse(userId, pageable)
                .map(this::mapToResponse);
    }

    // ─── U3: Get URL by ID ────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public UrlResponse getUrlById(Long id, Long userId, boolean isAdmin) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return mapToResponse(url);
    }

    // ─── U4: Update URL ───────────────────────────────────────────────────────
    @Override
    @Transactional
    public UrlResponse updateUrl(Long id, Long userId, boolean isAdmin, UpdateUrlRequest request) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }

        if (request.getTitle() != null) url.setTitle(request.getTitle());
        if (request.getActive() != null) url.setActive(request.getActive());
        if (request.isRemoveExpiry()) {
            url.setExpiryDate(null);
        } else if (request.getExpiryDate() != null) {
            url.setExpiryDate(request.getExpiryDate());
        }
        if (request.isRemovePassword()) {
            url.setPasswordHash(null);
        } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
            url.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        Url saved = urlRepository.save(url);
        evictCache(url.getShortCode());
        cacheUrl(saved);
        return mapToResponse(saved);
    }

    // ─── U5: Soft Delete ──────────────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteUrl(Long id, Long userId, boolean isAdmin) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }
        url.setDeleted(true);
        url.setActive(false);
        urlRepository.save(url);
        evictCache(url.getShortCode());
    }

    // ─── U6: Check Alias ──────────────────────────────────────────────────────
    @Override
    public AliasCheckResponse checkAlias(String alias) {
        if (alias == null || alias.isBlank()) {
            return new AliasCheckResponse(alias, false);
        }
        boolean reserved = RESERVED_WORDS.contains(alias.toLowerCase());
        boolean taken = urlRepository.existsByShortCode(alias.toLowerCase());
        return new AliasCheckResponse(alias, !reserved && !taken);
    }

    // ─── U7: Generate QR Code ────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public byte[] generateQrCode(Long id, Long userId, boolean isAdmin) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }
        try {
            String shortUrl = baseUrl + "/" + url.getShortCode();
            BitMatrix matrix = new MultiFormatWriter().encode(shortUrl, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage());
        }
    }

    // ─── Redirect Lookup ──────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public UrlResponse getUrlByShortCode(String shortCode) {
        // Try Redis first
        String cacheKey = REDIS_URL_PREFIX + shortCode;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached instanceof UrlResponse) {
            return (UrlResponse) cached;
        }

        Url url = urlRepository.findByShortCodeAndDeletedFalse(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));

        UrlResponse response = mapToResponse(url);
        cacheUrl(url);
        return response;
    }

    // ─── Redis Helpers ────────────────────────────────────────────────────────

    private void cacheUrl(Url url) {
        try {
            String key = REDIS_URL_PREFIX + url.getShortCode();
            UrlResponse dto = mapToResponse(url);
            if (url.getExpiryDate() != null) {
                long ttlSeconds = java.time.Duration.between(LocalDateTime.now(), url.getExpiryDate()).getSeconds();
                if (ttlSeconds > 0) {
                    redisTemplate.opsForValue().set(key, dto, ttlSeconds, TimeUnit.SECONDS);
                }
            } else {
                redisTemplate.opsForValue().set(key, dto, 24, TimeUnit.HOURS);
            }
        } catch (Exception e) {
            log.warn("Failed to cache URL {}: {}", url.getShortCode(), e.getMessage());
        }
    }

    private void evictCache(String shortCode) {
        try {
            redisTemplate.delete(REDIS_URL_PREFIX + shortCode);
        } catch (Exception e) {
            log.warn("Failed to evict cache for {}: {}", shortCode, e.getMessage());
        }
    }

    // ─── Rate Limiting ────────────────────────────────────────────────────────

    private void checkGuestRateLimit(String ipAddress) {
        String key = REDIS_RATE_PREFIX + ipAddress;
        Object count = redisTemplate.opsForValue().get(key);
        if (count != null && Integer.parseInt(count.toString()) >= guestDailyLimit) {
            throw new RateLimitExceededException("Guest rate limit reached. Maximum " + guestDailyLimit + " URLs per day per IP.");
        }
    }

    private void incrementGuestCounter(String ipAddress) {
        try {
            String key = REDIS_RATE_PREFIX + ipAddress;
            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, 1, TimeUnit.DAYS);
        } catch (Exception e) {
            log.warn("Rate limit increment failed: {}", e.getMessage());
        }
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    public UrlResponse mapToResponse(Url url) {
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
                .qrCodeUrl(baseUrl + "/api/v1/urls/" + url.getId() + "/qr")
                .createdAt(url.getCreatedAt())
                .updatedAt(url.getUpdatedAt())
                .build();
    }
}
