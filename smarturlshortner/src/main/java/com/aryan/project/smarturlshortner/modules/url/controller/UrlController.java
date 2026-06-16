package com.aryan.project.smarturlshortner.modules.url.controller;

import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.request.UpdateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.AliasCheckResponse;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.service.UrlService;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/urls")
@RequiredArgsConstructor
@Tag(name = "URL Management", description = "Create, list, update, delete and manage short URLs")
public class UrlController {

    private final UrlService urlService;

    // U1: Create
    @PostMapping
    @Operation(summary = "Create short URL (guest or authenticated)")
    public ResponseEntity<ResponseStructure<UrlResponse>> createUrl(
            @Valid @RequestBody CreateUrlRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        Long userId = user != null ? user.getId() : null;
        String ip = httpRequest.getRemoteAddr();
        UrlResponse response = urlService.createShortUrl(request, userId, ip);
        return ResponseBuilder.success(HttpStatus.CREATED, "Short URL created successfully", response);
    }

    // U2: List
    @GetMapping
    @Operation(summary = "List user's URLs (paginated, filterable)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ResponseStructure<Page<UrlResponse>>> listUrls(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);
        Page<UrlResponse> urls = urlService.getUserUrls(user.getId(), search, status, pageable);
        return ResponseBuilder.success(HttpStatus.OK, "URLs retrieved successfully", urls);
    }

    // U3: Get by ID
    @GetMapping("/{id}")
    @Operation(summary = "Get URL details by ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ResponseStructure<UrlResponse>> getUrl(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        boolean isAdmin = isAdmin();
        return ResponseBuilder.success(HttpStatus.OK, "URL retrieved", urlService.getUrlById(id, user.getId(), isAdmin));
    }

    // U4: Update
    @PutMapping("/{id}")
    @Operation(summary = "Update URL (title, expiry, status, password)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ResponseStructure<UrlResponse>> updateUrl(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUrlRequest request) {
        boolean isAdmin = isAdmin();
        return ResponseBuilder.success(HttpStatus.OK, "URL updated successfully", urlService.updateUrl(id, user.getId(), isAdmin, request));
    }

    // U5: Delete
    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete URL")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ResponseStructure<Void>> deleteUrl(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        boolean isAdmin = isAdmin();
        urlService.deleteUrl(id, user.getId(), isAdmin);
        return ResponseBuilder.success(HttpStatus.OK, "URL deleted successfully", null);
    }

    // U6: Check alias
    @GetMapping("/check-alias")
    @Operation(summary = "Check alias availability")
    public ResponseEntity<ResponseStructure<AliasCheckResponse>> checkAlias(@RequestParam String alias) {
        return ResponseBuilder.success(HttpStatus.OK, "Alias availability checked", urlService.checkAlias(alias));
    }

    // U7: QR Code
    @GetMapping("/{id}/qr")
    @Operation(summary = "Generate QR code for URL")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<byte[]> getQrCode(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        boolean isAdmin = isAdmin();
        byte[] qrBytes = urlService.generateQrCode(id, user.getId(), isAdmin);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return ResponseEntity.ok().headers(headers).body(qrBytes);
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication() != null &&
               SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                       .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
