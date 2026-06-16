package com.aryan.project.smarturlshortner.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResetPasswordRequest {
    @NotBlank
    private String token;

    @NotBlank @Size(min = 8)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "Password must have uppercase, lowercase and digit")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
