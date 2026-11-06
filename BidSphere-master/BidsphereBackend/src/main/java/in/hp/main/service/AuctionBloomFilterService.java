//package in.hp.main.service;
//
//import in.hp.main.repository.AuctionRepository;
//import org.springframework.boot.ApplicationArguments;
//import org.springframework.boot.ApplicationRunner;
//import org.springframework.data.redis.core.StringRedisTemplate;
//import org.springframework.data.redis.core.script.DefaultRedisScript;
//import org.springframework.stereotype.Service;
//
//import java.util.Collections;
//import java.util.List;
//import java.util.concurrent.atomic.AtomicBoolean;
//
//@Service
//public class AuctionBloomFilterService implements ApplicationRunner {
//
//    private static final String BLOOM_KEY = "auction:ids";
//    private static final String FILTER_KEY = "auction:cuckoo:ids";
//
//    private final StringRedisTemplate redisTemplate;
//    private final AuctionRepository auctionRepository;
//
//    private final AtomicBoolean initialized = new AtomicBoolean(false);
//
//    public AuctionBloomFilterService(
//            StringRedisTemplate redisTemplate,
//            AuctionRepository auctionRepository) {
//        this.redisTemplate = redisTemplate;
//        this.auctionRepository = auctionRepository;
//    }
//
//    @Override
//    public void run(ApplicationArguments args) {
//        List<Long> auctionIds = auctionRepository.findAllAuctionIds();
//
//        for (Long id : auctionIds) {
//            addAuctionId(id);
//        }
//
//        initialized.set(true);
//
//        System.out.println(
//                "Auction Bloom filter initialized with "
//                        + auctionIds.size() + " auction IDs"
//        );
//    }
//
//    public void addAuctionId(Long id) {
//        if (id == null) {
//            return;
//        }
//
//        String script = """
//                return redis.call('BF.ADD', KEYS[1], ARGV[1])
//                """;
//
//        redisTemplate.execute(
//                new DefaultRedisScript<>(script, Long.class),
//                Collections.singletonList(BLOOM_KEY),
//                id.toString()
//        );
//    }
//
//    public boolean mightExist(Long id) {
//        if (id == null) {
//            return false;
//        }
//
//        // If initialization has not completed, avoid rejecting valid auctions.
//        if (!initialized.get()) {
//            return true;
//        }
//        try {
//            String script = """
//                    if redis.call('EXISTS', KEYS[1]) == 0 then
//                        return -1
//                    end
//
//                    return redis.call('BF.EXISTS', KEYS[1], ARGV[1])
//                    """;
//
//            Long result = redisTemplate.execute(
//                    new DefaultRedisScript<>(script, Long.class),
//                    Collections.singletonList(BLOOM_KEY),
//                    id.toString()
//            );
//
//            if (result == null || result == -1L) {
//                return true;
//            }
//
//            return result == 1L;
//        } catch (Exception e) {
//            System.err.println(
//                    "Bloom filter unavailable; allowing database fallback: "
//                            + e.getMessage()
//            );
//
//            return true;
//        }
//    }
//    public void removeAuctionId(Long id) {
//        if (id == null) {
//            return;
//        }
//
//        String script = """
//        return redis.call('CF.DEL', KEYS[1], ARGV[1])
//        """;
//
//        redisTemplate.execute(
//                new DefaultRedisScript<>(script, Long.class),
//                Collections.singletonList(FILTER_KEY),
//                id.toString()
//        );
//    }
//}
package in.hp.main.service;

import in.hp.main.repository.AuctionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
public class AuctionBloomFilterService implements ApplicationRunner {

    private static final String FILTER_KEY = "auction:cuckoo:ids";
    private static final long CAPACITY = 100_000;

    private static final DefaultRedisScript<Long> ADD_SCRIPT =
            new DefaultRedisScript<>("return redis.call('CF.ADDNX', KEYS[1], ARGV[1])", Long.class);

    private static final DefaultRedisScript<Long> DEL_SCRIPT =
            new DefaultRedisScript<>("return redis.call('CF.DEL', KEYS[1], ARGV[1])", Long.class);

    private static final DefaultRedisScript<Long> EXISTS_SCRIPT = new DefaultRedisScript<>(
            """
            if redis.call('EXISTS', KEYS[1]) == 0 then
                return -1
            end
            return redis.call('CF.EXISTS', KEYS[1], ARGV[1])
            """, Long.class);

    private static final DefaultRedisScript<String> RESERVE_SCRIPT =
            new DefaultRedisScript<>("return redis.call('CF.RESERVE', KEYS[1], ARGV[1])", String.class);

    private final StringRedisTemplate redisTemplate;
    private final AuctionRepository auctionRepository;
    private final AtomicBoolean initialized = new AtomicBoolean(false);

    public AuctionBloomFilterService(
            StringRedisTemplate redisTemplate,
            AuctionRepository auctionRepository) {
        this.redisTemplate = redisTemplate;
        this.auctionRepository = auctionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            redisTemplate.delete(FILTER_KEY);
            redisTemplate.execute(RESERVE_SCRIPT,
                    Collections.singletonList(FILTER_KEY), String.valueOf(CAPACITY));

            List<Long> ids = auctionRepository.findAllAuctionIds();
            for (Long id : ids) {
                addAuctionId(id);
            }

            initialized.set(true);
            log.info("Cuckoo filter initialized with {} auction IDs", ids.size());
        } catch (Exception e) {
            log.error("Cuckoo filter initialization failed; falling back to database", e);
        }
    }

    public void addAuctionId(Long id) {
        if (id == null) return;
        try {
            redisTemplate.execute(ADD_SCRIPT, Collections.singletonList(FILTER_KEY), id.toString());
        } catch (Exception e) {
            log.warn("Failed to add auction {} to filter: {}", id, e.getMessage());
        }
    }

    public void removeAuctionId(Long id) {
        if (id == null) return;
        try {
            redisTemplate.execute(DEL_SCRIPT, Collections.singletonList(FILTER_KEY), id.toString());
        } catch (Exception e) {
            log.warn("Failed to remove auction {} from filter: {}", id, e.getMessage());
        }
    }

    public boolean mightExist(Long id) {
        if (id == null) return false;
        if (!initialized.get()) return true;

        try {
            Long result = redisTemplate.execute(
                    EXISTS_SCRIPT, Collections.singletonList(FILTER_KEY), id.toString());

            if (result == null || result == -1L) return true;
            return result == 1L;
        } catch (Exception e) {
            log.warn("Cuckoo filter unavailable; allowing database fallback: {}", e.getMessage());
            return true;
        }
    }
}