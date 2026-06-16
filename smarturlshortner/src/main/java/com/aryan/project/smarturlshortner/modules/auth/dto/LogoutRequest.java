package com.aryan.project.smarturlshortner.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogoutRequest {
    @NotBlank
    private String refreshToken;
}
