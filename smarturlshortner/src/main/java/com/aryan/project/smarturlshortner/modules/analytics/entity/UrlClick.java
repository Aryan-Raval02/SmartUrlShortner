package com.aryan.project.smarturlshortner.modules.analytics.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "url_clicks", indexes = {
    @Index(name = "idx_url_clicks_url_id", columnList = "url_id"),
    @Index(name = "idx_url_clicks_clicked_at", columnList = "clicked_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UrlClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_id", nullable = false)
    private Long urlId;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(length = 100)
    private String browser;

    @Column(length = 100)
    private String os;

    @Column(name = "device_type", length = 50)
    private String deviceType; // Desktop | Mobile | Tablet

    @Column(columnDefinition = "TEXT")
    private String referrer;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @CreationTimestamp
    @Column(name = "clicked_at", updatable = false)
    private LocalDateTime clickedAt;
}
