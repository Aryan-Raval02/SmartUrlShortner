package com.aryan.project.smarturlshortner.modules.url.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateUrlRequest {
    @Size(max = 150)
    private String title;

    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiryDate;

    private Boolean active;   // null = no change
    private String password;  // null = remove password; empty string = no change
    private boolean removeExpiry = false;
    private boolean removePassword = false;
}
