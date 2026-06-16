package com.aryan.project.smarturlshortner.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank @Size(min = 2, max = 150)
    private String fullName;

    @NotBlank @Size(min = 3, max = 50) @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8) @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "Password must contain at least one uppercase, one lowercase and one digit")
    private String password;
}
