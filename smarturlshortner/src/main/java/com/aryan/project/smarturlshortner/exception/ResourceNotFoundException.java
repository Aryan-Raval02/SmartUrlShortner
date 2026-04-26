package com.aryan.project.smarturlshortner.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiBaseException{

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
