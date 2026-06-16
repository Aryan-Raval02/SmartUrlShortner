package com.aryan.project.smarturlshortner.modules.admin.dto;
import lombok.*;
import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUrlResponse { private Long id; private String shortCode; private String originalUrl; private Long userId; private boolean active; private boolean suspicious; private Long totalClicks; private LocalDateTime createdAt; }
