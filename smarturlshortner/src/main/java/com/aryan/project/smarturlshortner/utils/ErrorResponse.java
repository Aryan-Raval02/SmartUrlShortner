package com.aryan.project.smarturlshortner.utils;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonPropertyOrder({
        "status",
        "error",
        "timestamp",
        "message",
        "path",
        "validationErrors"
})
public class ErrorResponse {
    private Integer status;
    private String message;
    private LocalDateTime timestamp;
    private String error;
    private String path;
    private Map<String, String> validationErrors;
}
