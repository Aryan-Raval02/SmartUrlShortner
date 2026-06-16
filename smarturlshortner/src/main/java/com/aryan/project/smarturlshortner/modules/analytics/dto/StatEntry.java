package com.aryan.project.smarturlshortner.modules.analytics.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StatEntry {
    private String name;
    private long count;
    private double percentage;
}
