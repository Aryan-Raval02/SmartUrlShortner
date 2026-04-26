package com.aryan.project.smarturlshortner.modules.url.dto.request;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUrlRequest {
    private String originalUrl;
    private String customAlias;
    private String title;
    private LocalDateTime expiryDate;
    private String password;
}
