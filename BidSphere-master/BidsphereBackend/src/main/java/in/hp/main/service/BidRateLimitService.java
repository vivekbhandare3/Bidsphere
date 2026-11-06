package in.hp.main.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class BidRateLimitService {

    private static final Logger log =
            LoggerFactory.getLogger(BidRateLimitService.class);

    private final StringRedisTemplate redisTemplate;

    // ADDED: Example limit. Tune according to your traffic.
    private static final int MAX_REQUESTS = 10;

    // ADDED: Window length in seconds.
    private static final int WINDOW_SECONDS = 10;

    public BidRateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // ADDED: INCR and EXPIRE execute atomically in one Lua script.
    private static final DefaultRedisScript<Long> RATE_LIMIT_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local count = redis.call('INCR', KEYS[1])

                    if count == 1 then
                        redis.call('EXPIRE', KEYS[1], ARGV[1])
                    end

                    return count
                    """,
                    Long.class
            );

    /**
     * Returns true if the user is allowed to make this request.
     */
    public boolean isAllowed(String userId) {

        if (userId == null || userId.isBlank()) {
            // CHANGED: Never use a shared "null" identity for users.
            return false;
        }

        // ADDED: Separate counter for each authenticated user.
        String key = "rate-limit:bid:" + userId;
        log.info("Checking bid rate limit using key: {}", key);

        try {
            Long count = redisTemplate.execute(
                    RATE_LIMIT_SCRIPT,
                    Collections.singletonList(key),
                    String.valueOf(WINDOW_SECONDS)
            );
            log.info("Redis rate-limit counter for {}: {}", key, count);

            // ADDED: Unknown Redis result: fail open in this example.
            // This prioritizes availability but temporarily bypasses the limit.

            if (count == null) {
                log.warn("Rate-limit result unavailable; allowing request.");
                return true;
            }

            return count <= MAX_REQUESTS;

        } catch (Exception e) {
            // ADDED: A Redis outage does not automatically block bidding.
            log.error("Redis rate limiting unavailable; allowing request.", e);
            return true;
        }
    }
}