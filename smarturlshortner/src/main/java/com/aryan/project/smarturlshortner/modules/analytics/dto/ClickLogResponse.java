package com.aryan.project.smarturlshortner.modules.analytics.dto;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClickLogResponse { private Long id; private String ipAddress; private String browser; private String os; private String deviceType; private String referrer; private String country; private String city; private LocalDateTime clickedAt; }
