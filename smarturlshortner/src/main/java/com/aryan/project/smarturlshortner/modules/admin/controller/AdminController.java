package com.aryan.project.smarturlshortner.modules.admin.controller;

import com.aryan.project.smarturlshortner.modules.admin.dto.*;
import com.aryan.project.smarturlshortner.modules.admin.service.AdminServiceImpl;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform administration endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminServiceImpl adminService;

    // ── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ResponseStructure<Page<AdminUserResponse>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseBuilder.success(HttpStatus.OK, "Users retrieved", adminService.listUsers(pageable));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user detail")
    public ResponseEntity<ResponseStructure<AdminUserResponse>> getUserDetail(@PathVariable Long id) {
        return ResponseBuilder.success(HttpStatus.OK, "User retrieved", adminService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/block")
    @Operation(summary = "Toggle block/unblock user")
    public ResponseEntity<ResponseStructure<AdminUserResponse>> toggleBlock(@PathVariable Long id) {
        return ResponseBuilder.success(HttpStatus.OK, "User status updated", adminService.toggleBlockUser(id));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<ResponseStructure<AdminUserResponse>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseBuilder.success(HttpStatus.OK, "Role updated", adminService.changeUserRole(id, body.get("role")));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Hard delete user")
    public ResponseEntity<ResponseStructure<Void>> deleteUser(@PathVariable Long id) {
        adminService.hardDeleteUser(id);
        return ResponseBuilder.success(HttpStatus.OK, "User deleted", null);
    }

    @PutMapping("/users/bulk/block")
    @Operation(summary = "Bulk block users")
    public ResponseEntity<ResponseStructure<Void>> bulkBlock(@RequestBody Map<String, List<Long>> body) {
        adminService.bulkBlockUsers(body.get("ids"));
        return ResponseBuilder.success(HttpStatus.OK, "Users blocked", null);
    }

    // ── URLs ─────────────────────────────────────────────────────────────────

    @GetMapping("/urls")
    @Operation(summary = "List all URLs")
    public ResponseEntity<ResponseStructure<Page<AdminUrlResponse>>> listAllUrls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseBuilder.success(HttpStatus.OK, "URLs retrieved", adminService.listAllUrls(pageable));
    }

    @PutMapping("/urls/{id}/disable")
    @Operation(summary = "Toggle disable/enable URL")
    public ResponseEntity<ResponseStructure<AdminUrlResponse>> toggleDisable(@PathVariable Long id) {
        return ResponseBuilder.success(HttpStatus.OK, "URL status updated", adminService.toggleDisableUrl(id));
    }

    @DeleteMapping("/urls/{id}")
    @Operation(summary = "Hard delete URL")
    public ResponseEntity<ResponseStructure<Void>> deleteUrl(@PathVariable Long id) {
        adminService.hardDeleteUrl(id);
        return ResponseBuilder.success(HttpStatus.OK, "URL deleted", null);
    }

    @DeleteMapping("/urls/bulk")
    @Operation(summary = "Bulk delete URLs")
    public ResponseEntity<ResponseStructure<Void>> bulkDeleteUrls(@RequestBody Map<String, List<Long>> body) {
        adminService.bulkDeleteUrls(body.get("ids"));
        return ResponseBuilder.success(HttpStatus.OK, "URLs deleted", null);
    }

    @PutMapping("/urls/bulk/disable")
    @Operation(summary = "Bulk disable URLs")
    public ResponseEntity<ResponseStructure<Void>> bulkDisableUrls(@RequestBody Map<String, List<Long>> body) {
        adminService.bulkDisableUrls(body.get("ids"));
        return ResponseBuilder.success(HttpStatus.OK, "URLs disabled", null);
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Platform analytics summary")
    public ResponseEntity<ResponseStructure<PlatformStatsResponse>> getDashboard() {
        return ResponseBuilder.success(HttpStatus.OK, "Platform stats retrieved", adminService.getPlatformStats());
    }
}
