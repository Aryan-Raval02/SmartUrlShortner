package com.aryan.project.smarturlshortner.exception;

import org.springframework.http.HttpStatus;

public class AliasAlreadyTakenException extends ApiBaseException {
    public AliasAlreadyTakenException(String alias) {
        super(HttpStatus.CONFLICT, "Alias '" + alias + "' is already taken and cannot be reused.");
    }
}
