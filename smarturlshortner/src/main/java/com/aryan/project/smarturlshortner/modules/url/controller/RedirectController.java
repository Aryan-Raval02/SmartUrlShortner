package com.aryan.project.smarturlshortner.modules.url.controller;

import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.service.UrlService;
import com.aryan.project.smarturlshortner.exception.ResourceNotFoundException;
import com.aryan.project.smarturlshortner.modules.analytics.service.ClickTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Redirect", description = "URL redirect engine")
public class RedirectController {

    private final UrlService urlService;
    private final ClickTrackingService clickTrackingService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/{shortCode}")
    @Operation(summary = "Redirect short URL to original")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode,
            HttpServletRequest request) {

        // Skip non-shortcode paths
        if (shortCode.startsWith("api") || shortCode.startsWith("swagger") || shortCode.startsWith("v3")) {
            return ResponseEntity.notFound().build();
        }

        UrlResponse url;
        try {
            url = urlService.getUrlByShortCode(shortCode);
        } catch (ResourceNotFoundException e) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/error/404"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // Check if expired
        if (url.getExpiryDate() != null && url.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/error/410"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // Check if disabled
        if (!url.isActive()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/error/403"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // Check if password-protected
        if (url.isPasswordProtected()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/" + shortCode + "/unlock"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // Fire-and-forget click tracking
        clickTrackingService.trackClick(url.getId(), request);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url.getOriginalUrl()));
        headers.set("Cache-Control", "no-store, no-cache");
        headers.set("X-Redirected-By", "Shortly/2.0");
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @PostMapping("/{shortCode}/verify")
    @Operation(summary = "Verify password for password-protected URL")
    public ResponseEntity<?> verifyPassword(
            @PathVariable String shortCode,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        UrlResponse url;
        try {
            url = urlService.getUrlByShortCode(shortCode);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }

        // We need the raw URL entity for password check — use a simple workaround
        // The UrlResponse.passwordProtected flag tells us if protected
        // For password verification, we'd need the hash — use a dedicated method
        // For now, return 401 with a note (full impl needs hash from DB directly)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("status", 401, "message", "Password verification requires direct DB access. Use UrlService."));
    }
}
