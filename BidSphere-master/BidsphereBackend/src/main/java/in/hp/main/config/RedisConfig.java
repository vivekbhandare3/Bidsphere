package in.hp.main.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Typed serializer for application DTOs.
        GenericJacksonJsonRedisSerializer typed =GenericJacksonJsonRedisSerializer.builder()
                        .enableDefaultTyping(BasicPolymorphicTypeValidator.builder()
                                        .allowIfSubType("in.hp.main")
                                        .allowIfSubType("java.util.")
                                        .allowIfSubType("java.time.")
                                        .allowIfSubType("java.lang")
                                        .build()
                        ).build();
        // Plain JSON serializer for auction details.
        GenericJacksonJsonRedisSerializer plain =GenericJacksonJsonRedisSerializer.builder().build();

        RedisCacheConfiguration defaults =RedisCacheConfiguration.defaultCacheConfig().serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(typed));
        RedisCacheConfiguration auctionDetailsConfig =RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl((key, value) ->Duration.ofSeconds(
                                30 + ThreadLocalRandom.current().nextLong(0, 16))).serializeValuesWith(
                                RedisSerializationContext.SerializationPair.fromSerializer(plain));

        RedisCacheConfiguration auctionListingsConfig =RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl((key, value) ->Duration.ofSeconds(
                                        30 + ThreadLocalRandom.current().nextLong(0, 16))).serializeValuesWith(
                                RedisSerializationContext.SerializationPair.fromSerializer(typed));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults)
                .withCacheConfiguration("auctionDetails",auctionDetailsConfig)
                .withCacheConfiguration("auctionListings",auctionListingsConfig).build();
    }
}