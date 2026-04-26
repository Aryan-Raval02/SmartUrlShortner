package com.aryan.project.smarturlshortner.modules.url.constraint;

import com.aryan.project.smarturlshortner.exception.constraintHandling.ConstraintMessageResolver;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UrlConstraintResolver implements ConstraintMessageResolver {

    private static final Map<String, String> MAP = Map.of(
            "urls_short_code_key", "Short code already exists"
    );

    @Override
    public String resolve(String constraint) {
        return MAP.get(constraint);
    }
}
