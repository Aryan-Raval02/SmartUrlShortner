package com.aryan.project.smarturlshortner.modules.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long accessTokenExpiry;
    private long refreshTokenExpiry;
    private UserResponse user;
}
