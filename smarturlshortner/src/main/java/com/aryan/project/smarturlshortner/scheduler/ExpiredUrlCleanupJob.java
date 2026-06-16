package com.aryan.project.smarturlshortner.scheduler;

import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredUrlCleanupJob {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_URL_PREFIX = "url:shortcode:";

    // Run daily at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void deactivateExpiredUrls() {
        log.info("Running expired URL cleanup job...");
        List<Url> expiredUrls = urlRepository.findByExpiryDateBeforeAndActiveTrue(LocalDateTime.now());

        int count = 0;
        for (Url url : expiredUrls) {
            url.setActive(false);
            urlRepository.save(url);
            // Evict from Redis cache
            try {
                redisTemplate.delete(REDIS_URL_PREFIX + url.getShortCode());
            } catch (Exception e) {
                log.warn("Failed to evict cache for {}", url.getShortCode());
            }
            count++;
        }

        log.info("Expired URL cleanup complete. Deactivated {} URLs.", count);
    }
}
