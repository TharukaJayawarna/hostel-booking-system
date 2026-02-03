package com.hostel.hostel_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserCacheService {

    private final RedisTemplate<String, String> redisTemplate;

    // Key prefix to avoid collisions
    private static final String LOCK_STATUS_KEY = "user:lock_status:";

    public void cacheUserStatus(String username, boolean isNonLocked) {
        String key = LOCK_STATUS_KEY + username;
        // Store "LOCKED" or "OK"
        redisTemplate.opsForValue().set(key, isNonLocked ? "OK" : "LOCKED", 30, TimeUnit.MINUTES);
    }

    public String getUserStatus(String username) {
        return redisTemplate.opsForValue().get(LOCK_STATUS_KEY + username);
    }

    public void clearCache(String username) {
        redisTemplate.delete(LOCK_STATUS_KEY + username);
    }
}