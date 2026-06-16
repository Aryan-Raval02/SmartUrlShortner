package com.aryan.project.smarturlshortner.modules.public_api.controller;

import com.aryan.project.smarturlshortner.modules.auth.repository.UserRepository;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "Public statistics for landing page")
public class PublicController {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String STATS_CACHE_KEY = "public:platform:stats";

    @GetMapping("/stats")
    @Operation(summary = "Get public platform statistics")
    public ResponseEntity<ResponseStructure<Map<String, Long>>> getPublicStats() {
        // Check cache first (TTL 1 hour)
        Object cached = redisTemplate.opsForValue().get(STATS_CACHE_KEY);
        if (cached instanceof Map) {
            //noinspection unchecked
            return ResponseBuilder.success(HttpStatus.OK, "Platform statistics", (Map<String, Long>) cached);
        }

        long totalUrls = urlRepository.countTotalActiveUrls();
        Long totalClicks = urlRepository.sumTotalClicks();
        long totalUsers = userRepository.count();

        Map<String, Long> stats = Map.of(
                "totalUrls", totalUrls,
                "totalClicks", totalClicks != null ? totalClicks : 0L,
                "totalUsers", totalUsers
        );

        redisTemplate.opsForValue().set(STATS_CACHE_KEY, stats, 1, TimeUnit.HOURS);
        return ResponseBuilder.success(HttpStatus.OK, "Platform statistics", stats);
    }
}
