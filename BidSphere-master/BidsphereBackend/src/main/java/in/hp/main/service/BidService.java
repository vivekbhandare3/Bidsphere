package in.hp.main.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import in.hp.main.model.Users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class BidService {

    @Autowired
    private BidTransactionService bidTransactionService;

    // Evict caches only after a successful bid.
    @Caching(evict = {
            @CacheEvict(
                    value = "auctionListings",
                    allEntries = true,
                    condition = "#result.statusCode.value() == 200"
            ),
            @CacheEvict(
                    value = "auctionDetails",
                    key = "#auctionId",
                    condition = "#result.statusCode.value() == 200"
            ),
            @CacheEvict(
                    value = "adminDashboard",
                    allEntries = true,
                    condition = "#result.statusCode.value() == 200"
            )
    })
    public ResponseEntity<Map<String, String>> placeBid(
            Long auctionId,
            Users bidder,
            Double bidAmount) {

        try {
            String dbResult = bidTransactionService.executeDbTransaction(
                    auctionId,
                    bidder,
                    bidAmount
            );

            if ("SUCCESS".equals(dbResult)) {

                // Synchronize Firebase asynchronously.
                CompletableFuture.runAsync(() ->
                        syncFirebase(
                                auctionId,
                                bidAmount,
                                bidder.getUsername()
                        )
                );

                return createResponse(
                        "success",
                        "Bid placed successfully!",
                        200
                );
            }

            return createResponse(
                    "error",
                    dbResult,
                    400
            );

        } catch (ObjectOptimisticLockingFailureException e) {

            try {
                Thread.sleep(50);
            } catch (InterruptedException interruptedException) {
                Thread.currentThread().interrupt();
            }

            return createResponse(
                    "error",
                    "Failed to place bid due to high server load.",
                    409
            );
        }
    }

    private ResponseEntity<Map<String, String>> createResponse(
            String status,
            String message,
            int httpStatus) {

        Map<String, String> response = new HashMap<>();

        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.status(httpStatus).body(response);
    }

    private void syncFirebase(
            Long auctionId,
            Double bidAmount,
            String bidderName) {

        try {
            DatabaseReference ref = FirebaseDatabase.getInstance()
                    .getReference("auctions/" + auctionId);

            ref.child("currentPrice").setValueAsync(bidAmount);
            ref.child("highestBidder").setValueAsync(bidderName);

        } catch (Exception e) {
            System.err.println(
                    "Firebase push failed for auction " + auctionId
            );
        }
    }
}