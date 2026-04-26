package com.aryan.project.smarturlshortner.modules.url.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlResponse {
    private Long id;
    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private String title;
    private boolean active;
    private boolean passwordProtected;
    private LocalDateTime expiryDate;
    private Long totalClicks;
    private Long uniqueClicks;
    private LocalDateTime createdAt;
}
