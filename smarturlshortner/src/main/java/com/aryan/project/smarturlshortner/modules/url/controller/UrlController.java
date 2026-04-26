package com.aryan.project.smarturlshortner.modules.url.controller;

import com.aryan.project.smarturlshortner.modules.url.dto.request.CreateUrlRequest;
import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.service.UrlService;
import com.aryan.project.smarturlshortner.utils.ResponseBuilder;
import com.aryan.project.smarturlshortner.utils.ResponseStructure;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @PostMapping
    public ResponseEntity<ResponseStructure<UrlResponse>> createUrl(@RequestBody CreateUrlRequest request) {
        // For Phase 1, userId is null (guest)
        UrlResponse response = urlService.createShortUrl(request, null);
        return ResponseBuilder.success(HttpStatus.CREATED, "Short URL created successfully", response);
    }
}
