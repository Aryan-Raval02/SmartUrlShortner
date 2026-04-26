package com.aryan.project.smarturlshortner.modules.url.service;

import org.springframework.stereotype.Service;

@Service
public class Base62ServiceImpl implements Base62Service {

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /**
     * Encodes a numeric ID into a Base62 string.
     * Minimum length is ensured by prepending a prefix if necessary or 
     * by starting from a large initial offset.
     */
    @Override
    public String encode(long id) {
        StringBuilder sb = new StringBuilder();
        while (id > 0) {
            sb.append(BASE62.charAt((int) (id % 62)));
            id /= 62;
        }
        return sb.reverse().toString();
    }

    /**
     * Decodes a Base62 string back into a numeric ID.
     */
    @Override
    public long decode(String shortCode) {
        long id = 0;
        for (int i = 0; i < shortCode.length(); i++) {
            id = id * 62 + BASE62.indexOf(shortCode.charAt(i));
        }
        return id;
    }
}
