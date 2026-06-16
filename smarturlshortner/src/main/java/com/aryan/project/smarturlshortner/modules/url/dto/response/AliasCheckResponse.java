package com.aryan.project.smarturlshortner.modules.url.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AliasCheckResponse {
    private String alias;
    private boolean available;
}
