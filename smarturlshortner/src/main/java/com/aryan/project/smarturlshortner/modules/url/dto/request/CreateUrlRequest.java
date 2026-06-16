package com.aryan.project.smarturlshortner.modules.url.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateUrlRequest {
    @NotBlank(message = "Original URL is required")
    @org.hibernate.validator.constraints.URL(message = "Must be a valid URL")
    private String originalUrl;

    @Size(min = 3, max = 50, message = "Alias must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Alias can only contain letters, numbers, hyphens and underscores")
    private String customAlias;

    @Size(max = 150)
    private String title;

    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiryDate;

    @Size(min = 4, message = "Password must be at least 4 characters")
    private String password;

    private boolean generateQR = false;
}
