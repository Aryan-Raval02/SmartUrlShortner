package com.aryan.project.smarturlshortner.modules.url.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "urls", indexes = {
    @Index(name = "idx_short_code", columnList = "short_code"),
    @Index(name = "idx_url_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Url {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;   // NULL = guest

    @Column(name = "original_url", nullable = false, columnDefinition = "TEXT")
    private String originalUrl;

    @Column(name = "short_code", nullable = false, unique = true, length = 50)
    private String shortCode;

    @Column(length = 150)
    private String title;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean deleted = false;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "total_clicks")
    @Builder.Default
    private Long totalClicks = 0L;

    @Column(name = "unique_clicks")
    @Builder.Default
    private Long uniqueClicks = 0L;

    @Builder.Default
    private boolean suspicious = false;

    @Column(name = "suspicious_reason")
    private String suspiciousReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
