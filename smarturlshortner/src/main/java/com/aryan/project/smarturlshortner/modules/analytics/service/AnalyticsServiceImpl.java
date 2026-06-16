package com.aryan.project.smarturlshortner.modules.analytics.service;

import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.exception.UnauthorizedException;
import com.aryan.project.smarturlshortner.modules.analytics.dto.*;
import com.aryan.project.smarturlshortner.modules.analytics.repository.UrlClickRepository;
import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import com.aryan.project.smarturlshortner.modules.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl {

    private final UrlClickRepository clickRepository;
    private final UrlRepository urlRepository;

    // N1: Aggregated analytics for a URL
    @Transactional(readOnly = true)
    public AnalyticsResponse getAggregatedAnalytics(Long urlId, Long userId, boolean isAdmin) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }

        long totalClicks = clickRepository.countByUrlId(urlId);
        long uniqueClicks = clickRepository.countUniqueByUrlId(urlId);

        List<StatEntry> topBrowsers = toStatEntries(clickRepository.countByBrowser(urlId), totalClicks);
        List<StatEntry> topDevices = toStatEntries(clickRepository.countByDeviceType(urlId), totalClicks);
        List<CountryStat> topCountries = toCountryStats(clickRepository.countByCountry(urlId));
        List<StatEntry> referrers = toStatEntries(clickRepository.countByReferrer(urlId), totalClicks);
        List<DailyClickStat> dailyClicks = toDailyStats(clickRepository.dailyClicksSince(urlId, LocalDateTime.now().minusDays(30)));

        return AnalyticsResponse.builder()
                .totalClicks(totalClicks)
                .uniqueClicks(uniqueClicks)
                .topBrowsers(topBrowsers)
                .topDevices(topDevices)
                .topCountries(topCountries)
                .referrers(referrers)
                .dailyClicks(dailyClicks)
                .build();
    }

    // N2: User dashboard summary
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        List<Url> userUrls = urlRepository.findByUserIdAndDeletedFalse(userId, Pageable.unpaged()).getContent();
        long totalUrls = userUrls.size();
        long activeUrls = userUrls.stream().filter(Url::isActive).count();
        long totalClicks = userUrls.stream().mapToLong(Url::getTotalClicks).sum();
        long uniqueClicks = userUrls.stream().mapToLong(Url::getUniqueClicks).sum();

        return DashboardStatsResponse.builder()
                .totalUrls(totalUrls)
                .activeUrls(activeUrls)
                .totalClicks(totalClicks)
                .uniqueClicks(uniqueClicks)
                .build();
    }

    // N3: Raw click logs (paginated)
    @Transactional(readOnly = true)
    public Page<ClickLogResponse> getClickLogs(Long urlId, Long userId, boolean isAdmin, Pageable pageable) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found."));
        if (!isAdmin && !url.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied.");
        }

        return clickRepository.findByUrlId(urlId, pageable).map(click ->
                ClickLogResponse.builder()
                        .id(click.getId())
                        .ipAddress(maskIp(click.getIpAddress()))
                        .browser(click.getBrowser())
                        .os(click.getOs())
                        .deviceType(click.getDeviceType())
                        .referrer(click.getReferrer())
                        .country(click.getCountry())
                        .city(click.getCity())
                        .clickedAt(click.getClickedAt())
                        .build()
        );
    }

    private List<StatEntry> toStatEntries(List<Object[]> rows, long total) {
        return rows.stream().limit(10).map(row -> {
            String name = row[0] != null ? row[0].toString() : "Unknown";
            long count = ((Number) row[1]).longValue();
            double pct = total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0;
            return new StatEntry(name, count, pct);
        }).collect(Collectors.toList());
    }

    private List<CountryStat> toCountryStats(List<Object[]> rows) {
        return rows.stream().limit(10).map(row ->
                new CountryStat(
                        row[0] != null ? row[0].toString() : "Unknown",
                        row[1] != null ? row[1].toString() : "",
                        ((Number) row[2]).longValue()
                )).collect(Collectors.toList());
    }

    private List<DailyClickStat> toDailyStats(List<Object[]> rows) {
        return rows.stream().map(row ->
                new DailyClickStat(row[0].toString(), ((Number) row[1]).longValue())
        ).collect(Collectors.toList());
    }

    private String maskIp(String ip) {
        if (ip == null) return null;
        int lastDot = ip.lastIndexOf('.');
        return lastDot > 0 ? ip.substring(0, lastDot) + ".***" : ip;
    }
}
