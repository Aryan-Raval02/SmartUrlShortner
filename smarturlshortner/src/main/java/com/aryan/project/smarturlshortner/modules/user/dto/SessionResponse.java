package com.aryan.project.smarturlshortner.modules.user.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionResponse {
    private Long id;
    private String deviceInfo;
    private String ipAddress;
    private String location;
    private boolean isCurrent;
    private LocalDateTime createdAt;
}
