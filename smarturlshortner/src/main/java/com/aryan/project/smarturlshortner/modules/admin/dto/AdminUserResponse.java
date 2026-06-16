package com.aryan.project.smarturlshortner.modules.admin.dto;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUserResponse { private Long id; private String username; private String email; private String fullName; private String role; private String status; private boolean emailVerified; private LocalDateTime createdAt; }
