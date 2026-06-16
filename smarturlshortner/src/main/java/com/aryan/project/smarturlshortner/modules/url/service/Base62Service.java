package com.aryan.project.smarturlshortner.modules.url.service;

public interface Base62Service {
    String encode(long id);

    long decode(String shortCode);

    String generateRandomCode(int length);
}
