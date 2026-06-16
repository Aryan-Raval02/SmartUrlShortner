package com.aryan.project.smarturlshortner.modules.analytics.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsResponse { private long totalUrls; private long activeUrls; private long totalClicks; private long uniqueClicks; }
