package com.aryan.project.smarturlshortner.modules.analytics.controller;

import com.aryan.project.smarturlshortner.modules.analytics.dto.*;
import com.aryan.project.smarturlshortner.modules.analytics.service.AnalyticsServiceImpl;
import com.aryan.project.smarturlshortner.modules.auth.entity.User;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "URL click analytics and dashboard statistics")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsServiceImpl analyticsService;

    @GetMapping("/{urlId}")
    @Operation(summary = "Get aggregated analytics for a URL")
    public ResponseEntity<ResponseStructure<AnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable Long urlId) {
        boolean isAdmin = isAdmin();
        return ResponseBuilder.success(HttpStatus.OK, "Analytics retrieved",
                analyticsService.getAggregatedAnalytics(urlId, user.getId(), isAdmin));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get user dashboard summary stats")
    public ResponseEntity<ResponseStructure<DashboardStatsResponse>> getDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseBuilder.success(HttpStatus.OK, "Dashboard stats retrieved",
                analyticsService.getDashboardStats(user.getId()));
    }

    @GetMapping("/{urlId}/clicks")
    @Operation(summary = "Get paginated raw click logs")
    public ResponseEntity<ResponseStructure<Page<ClickLogResponse>>> getClickLogs(
            @AuthenticationPrincipal User user,
            @PathVariable Long urlId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("clickedAt").descending());
        boolean isAdmin = isAdmin();
        return ResponseBuilder.success(HttpStatus.OK, "Click logs retrieved",
                analyticsService.getClickLogs(urlId, user.getId(), isAdmin, pageable));
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication() != null &&
               SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                       .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
