package com.aryan.project.smarturlshortner.modules.url.controller;

import com.aryan.project.smarturlshortner.modules.url.dto.response.UrlResponse;
import com.aryan.project.smarturlshortner.modules.url.service.UrlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class RedirectController {

    private final UrlService urlService;

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        UrlResponse url = urlService.getUrlByShortCode(shortCode);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url.getOriginalUrl()));
        
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
