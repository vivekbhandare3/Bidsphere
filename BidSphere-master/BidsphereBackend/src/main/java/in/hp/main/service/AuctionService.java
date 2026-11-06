package in.hp.main.service;

import in.hp.main.dto.response.AuctionPageCache;
import in.hp.main.dto.response.AuctionResponse;
import in.hp.main.model.Auction;
import in.hp.main.repository.AuctionRepository;
import in.hp.main.model.Bid;

import in.hp.main.repository.BidRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
@Slf4j
@Service
public class AuctionService {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;
    @Autowired
    private CacheManager cacheManager;

    public Page<AuctionResponse> viewAll(
            String keyword,
            String status,
            String sortString,
            int pageNo,
            int pageSize) {

        if (pageNo < 1) {
            pageNo = 1;
        }

        if (pageSize < 1) {
            pageSize = 10;
        }

        String normalizedKeyword =
                keyword == null ? "" : keyword.trim();

        String normalizedStatus =
                status == null ? "All Status" : status.trim();

        String normalizedSort =
                sortString == null ? "Newest First" : sortString.trim();

        // Create a unique cache key for each filter, sort and page.
        String cacheKey =
                normalizedKeyword + "-"
                        + normalizedStatus + "-"
                        + normalizedSort + "-"
                        + pageNo + "-"
                        + pageSize;

        Cache cache = cacheManager.getCache("auctionListings");

        if (cache == null) {
            throw new IllegalStateException(
                    "auctionListings cache is not configured"
            );
        }

        // CHANGED: Continue to MySQL if the manual Redis cache read fails.
        AuctionPageCache cachedData = null;

        try {
            cachedData = cache.get(cacheKey, AuctionPageCache.class);
        } catch (Exception e) {
            System.err.println(
                    "Redis cache read failed; fetching auctions from MySQL: "
                            + e.getMessage()
            );
        }

        if (cachedData != null) {

            System.out.println(
                    "Auction listings CACHE HIT. Key: " + cacheKey
            );

            Pageable cachedPageable = PageRequest.of(
                    cachedData.getPageNumber(),
                    cachedData.getPageSize()
            );

            return new PageImpl<>(
                    cachedData.getContent(),
                    cachedPageable,
                    cachedData.getTotalElements()
            );
        }

        System.out.println(
                "Auction listings CACHE MISS. Key: " + cacheKey
        );

        List<Auction> auctions = auctionRepository.findAll();

        String keywordLower =
                normalizedKeyword.toLowerCase(Locale.ROOT);

        List<Auction> filteredAuctions = auctions.stream()
                .filter(a -> {

                    boolean matchesKeyword =
                            keywordLower.isEmpty()
                                    || (a.getProductName() != null
                                    && a.getProductName()
                                    .toLowerCase(Locale.ROOT)
                                    .contains(keywordLower))
                                    || (a.getDescription() != null
                                    && a.getDescription()
                                    .toLowerCase(Locale.ROOT)
                                    .contains(keywordLower));

                    boolean matchesStatus =
                            normalizedStatus.isEmpty()
                                    || normalizedStatus.equalsIgnoreCase(
                                    "All Status"
                            )
                                    || (a.getStatus() != null
                                    && a.getStatus().equalsIgnoreCase(
                                    normalizedStatus
                            ));

                    return matchesKeyword && matchesStatus;
                })
                .collect(Collectors.toList());

        Comparator<Auction> comparator;

        if ("Price: Low to High".equals(normalizedSort)) {

            comparator = Comparator.comparing(
                    Auction::getCurrentPrice,
                    Comparator.nullsLast(Comparator.naturalOrder())
            );

        } else if ("Price: High to Low".equals(normalizedSort)) {

            comparator = Comparator.comparing(
                    Auction::getCurrentPrice,
                    Comparator.nullsLast(Comparator.reverseOrder())
            );

        } else if ("Newest First".equals(normalizedSort)) {

            comparator = Comparator.comparing(
                    Auction::getStartTime,
                    Comparator.nullsLast(Comparator.reverseOrder())
            );

        } else {

            comparator = Comparator.comparing(
                    Auction::getId,
                    Comparator.nullsLast(Comparator.reverseOrder())
            );
        }

        filteredAuctions.sort(comparator);

        long totalElements = filteredAuctions.size();

        int start = (pageNo - 1) * pageSize;

        List<Auction> pageAuctions;

        if (start >= filteredAuctions.size()) {

            pageAuctions = new ArrayList<>();

        } else {

            int end = Math.min(
                    start + pageSize,
                    filteredAuctions.size()
            );

            pageAuctions = filteredAuctions.subList(start, end);
        }

        List<AuctionResponse> responses = pageAuctions.stream()
                .map(a -> new AuctionResponse(
                        a.getId(),
                        a.getProductName(),
                        a.getDescription(),
                        a.getCurrentPrice(),
                        a.getStatus(),
                        a.getSellerName(),

                        a.getCategory() != null
                                ? a.getCategory().getName()
                                : "Uncategorized",

                        a.getImageUrls() != null
                                && !a.getImageUrls().isEmpty()
                                ? new ArrayList<>(a.getImageUrls())
                                : null,

                        a.getPayment(),

                        a.getStartTime() != null
                                ? a.getStartTime().toString()
                                : "",

                        a.getEndTime() != null
                                ? a.getEndTime().toString()
                                : "",

                        null
                ))
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil(
                (double) totalElements / pageSize
        );

        AuctionPageCache pageCache = new AuctionPageCache(
                responses,
                pageNo - 1,
                pageSize,
                totalElements,
                totalPages
        );
        try {
            // Save the listing data to Redis.
            cache.put(cacheKey, pageCache);
            log.info("Auction listings SAVED TO REDIS. Key: {}", cacheKey);

            System.out.println(
                    "Auction listings SAVED TO REDIS. Key: " + cacheKey
            );
        } catch (Exception e) {
            System.err.println("Redis cache write failed: " + e.getMessage());
            log.warn("Redis cache write failed. Auction data was still fetched from MySQL. Key: {}",
                    cacheKey, e);
        }

        Pageable pageable = PageRequest.of(
                pageNo - 1,
                pageSize
        );

        return new PageImpl<>(
                responses,
                pageable,
                totalElements
        );
    }


    @Cacheable(
            value = "auctionDetails",
            key = "#id",
            sync = true
    )
    public Map<String, Object> getAuctionDetails(Long id) {


        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Auction not found"
                ));


        Map<String, Object> response = new HashMap<>();

        response.put("id", auction.getId());
        response.put("productName", auction.getProductName());
        response.put("description", auction.getDescription());
        response.put("startingPrice", auction.getStartingPrice());
        response.put("currentPrice", auction.getCurrentPrice());
        response.put("status", auction.getStatus());
        response.put("sellerName", auction.getSellerName());

        response.put(
                "category",
                auction.getCategory() != null
                        ? auction.getCategory().getName()
                        : "Uncategorized"
        );

        response.put(
                "imageUrls",
                auction.getImageUrls() != null
                        ? new ArrayList<>(auction.getImageUrls())
                        : null
        );

        response.put("payment", auction.getPayment());
        response.put("paid", auction.isPaid());

        response.put(
                "startTime",
                auction.getStartTime() != null
                        ? auction.getStartTime().toString()
                        : null
        );

        response.put(
                "endTime",
                auction.getEndTime() != null
                        ? auction.getEndTime().toString()
                        : null
        );
        List<Bid> bids =
                bidRepository.findBidHistoryByAuctionId(id);

        List<Map<String, Object>> bidHistory = bids.stream()
                .map(bid -> {

                    Map<String, Object> bidData = new HashMap<>();

                    bidData.put("id", bid.getId());
                    bidData.put("amount", bid.getAmount());

                    bidData.put(
                            "bidTime",
                            bid.getBidTime() != null
                                    ? bid.getBidTime().toString()
                                    : null
                    );

                    bidData.put(
                            "bidderName",
                            bid.getBidder() != null
                                    && bid.getBidder().getUsername() != null
                                    ? bid.getBidder().getUsername()
                                    : "Unknown User"
                    );

                    return bidData;
                })
                .collect(Collectors.toList());

        response.put("bidHistory", bidHistory);
        return response;
    }
}