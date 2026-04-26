package com.aryan.project.smarturlshortner.utils;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "status",
        "message",
        "data"
})
public class ResponseStructure<T> {

    private Integer status;
    private String message;
    private T data;
}
