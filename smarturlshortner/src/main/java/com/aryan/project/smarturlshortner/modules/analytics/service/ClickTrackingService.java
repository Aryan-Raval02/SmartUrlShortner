package com.aryan.project.smarturlshortner.modules.analytics.service;

import com.aryan.project.smarturlshortner.modules.analytics.entity.UrlClick;
import com.aryan.project.smarturlshortner.modules.analytics.repository.UrlClickRepository;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClickTrackingService {

    private final UrlClickRepository clickRepository;
    private final UrlRepository urlRepository;

    @Async("taskExecutor")
    @Transactional
    public void trackClick(Long urlId, HttpServletRequest request) {
        try {
            String ip = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String referrer = request.getHeader("Referer");

            String browser = parseBrowser(userAgent);
            String os = parseOs(userAgent);
            String deviceType = parseDeviceType(userAgent);

            // Geo-location via ip-api.com (free tier)
            String country = null;
            String city = null;
            try {
                RestTemplate restTemplate = new RestTemplate();
                @SuppressWarnings("unchecked")
                Map<String, Object> geoData = restTemplate.getForObject(
                        "http://ip-api.com/json/" + ip + "?fields=country,city,status",
                        Map.class);
                if (geoData != null && "success".equals(geoData.get("status"))) {
                    country = (String) geoData.get("country");
                    city = (String) geoData.get("city");
                }
            } catch (Exception e) {
                log.debug("Geo-location failed for IP {}: {}", ip, e.getMessage());
            }

            UrlClick click = UrlClick.builder()
                    .urlId(urlId)
                    .ipAddress(ip)
                    .browser(browser)
                    .os(os)
                    .deviceType(deviceType)
                    .referrer(referrer)
                    .country(country)
                    .city(city)
                    .build();

            clickRepository.save(click);

            // Increment counters on the URL record
            urlRepository.findById(urlId).ifPresent(url -> {
                url.setTotalClicks(url.getTotalClicks() + 1);
                // Simple unique check: count distinct IPs for this URL
                long uniqueCount = clickRepository.countUniqueByUrlId(urlId);
                url.setUniqueClicks(uniqueCount);
                urlRepository.save(url);
            });

        } catch (Exception e) {
            log.error("Click tracking failed for URL {}: {}", urlId, e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Edg/")) return "Edge";
        if (userAgent.contains("OPR/") || userAgent.contains("Opera")) return "Opera";
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("MSIE") || userAgent.contains("Trident")) return "Internet Explorer";
        return "Other";
    }

    private String parseOs(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iPhone") || userAgent.contains("iPad")) return "iOS";
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac OS")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        return "Other";
    }

    private String parseDeviceType(String userAgent) {
        if (userAgent == null) return "Desktop";
        if (userAgent.contains("Mobile") || userAgent.contains("iPhone") || userAgent.contains("Android")) return "Mobile";
        if (userAgent.contains("iPad") || userAgent.contains("Tablet")) return "Tablet";
        return "Desktop";
    }
}
