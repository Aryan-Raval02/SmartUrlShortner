package com.aryan.project.smarturlshortner.exception.constraintHandling;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ConstraintMessageResolverRegistry {

    private final List<ConstraintMessageResolver> resolvers;

    public ConstraintMessageResolverRegistry(List<ConstraintMessageResolver> resolvers) {
        this.resolvers = resolvers;
    }

    public String resolveMessage(String constraintName) {
        if (constraintName == null || constraintName.isBlank()) {
            return null;
        }

        for (ConstraintMessageResolver resolver : resolvers) {
            String message = resolver.resolve(constraintName);
            if (message != null) {
                return message;
            }
        }

        return null;
    }
}