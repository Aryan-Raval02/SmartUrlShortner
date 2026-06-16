package com.aryan.project.smarturlshortner.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends ApiBaseException {
    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
