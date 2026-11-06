        package in.hp.main.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheErrorConfig implements CachingConfigurer {

    private static final Logger log =
            LoggerFactory.getLogger(CacheErrorConfig.class);

    @Bean
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {

            @Override
            public void handleCacheGetError(
                    RuntimeException exception,
                    Cache cache,
                    Object key) {

                log.error(
                        "CACHE GET failed for cache {} and key {}. Falling back to database.",
                        cache.getName(), key, exception
                );
            }

            @Override
            public void handleCachePutError(
                    RuntimeException exception,
                    Cache cache,
                    Object key,
                    Object value) {

                log.error(
                        "CACHE PUT failed for cache {} and key {}.",
                        cache.getName(), key, exception
                );
            }

            @Override
            public void handleCacheEvictError(
                    RuntimeException exception,
                    Cache cache,
                    Object key) {

                log.error(
                        "CACHE EVICT failed for cache {} and key {}.",
                        cache.getName(), key, exception
                );
            }

            @Override
            public void handleCacheClearError(
                    RuntimeException exception,
                    Cache cache) {

                log.error(
                        "CACHE CLEAR failed for cache {}.",
                        cache.getName(), exception
                );
            }
        };
    }
}
