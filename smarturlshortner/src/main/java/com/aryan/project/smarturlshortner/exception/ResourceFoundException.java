package com.aryan.project.smarturlshortner.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ResourceFoundException extends ApiBaseException{
    private String message;

    public ResourceFoundException(String message) {
        super(HttpStatus.FOUND, message);
    }
}
