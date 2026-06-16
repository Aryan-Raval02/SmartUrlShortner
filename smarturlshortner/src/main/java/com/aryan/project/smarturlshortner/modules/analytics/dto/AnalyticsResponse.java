package com.aryan.project.smarturlshortner.modules.analytics.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsResponse {
    private long totalClicks;
    private long uniqueClicks;
    private List<StatEntry> topBrowsers;
    private List<StatEntry> topDevices;
    private List<CountryStat> topCountries;
    private List<StatEntry> referrers;
    private List<DailyClickStat> dailyClicks;
}
