package com.aryan.project.smarturlshortner.exception;

import org.springframework.http.HttpStatus;

public class RateLimitExceededException extends ApiBaseException {
    public RateLimitExceededException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
