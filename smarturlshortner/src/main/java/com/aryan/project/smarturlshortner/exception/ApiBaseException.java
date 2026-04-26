package com.aryan.project.smarturlshortner.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiBaseException extends RuntimeException{

    private HttpStatus status;

    public ApiBaseException(HttpStatus status, String message){
        super(message);
        this.status = status;
    }
}
