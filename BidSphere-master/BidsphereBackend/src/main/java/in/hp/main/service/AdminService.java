package in.hp.main.service;

import com.google.firebase.database.FirebaseDatabase;

import in.hp.main.model.Auction;
import in.hp.main.repository.AuctionRepository;
import in.hp.main.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private AuctionBloomFilterService bloomFilterService;
    @Cacheable(value = "adminDashboard")
    public Map<String, Object> dashboard() {

        Map<String, Object> data = new HashMap<>();

        List<Map<String, Object>> safeUsers =
                userRepository.findAll().stream().map(u -> {

                    Map<String, Object> userMap = new HashMap<>();

                    userMap.put("id", u.getId());
                    userMap.put("username", u.getUsername());

                    userMap.put(
                            "role",
                            u.getRole() != null
                                    ? u.getRole().name()
                                    : "USER"
                    );

                    return userMap;

                }).collect(Collectors.toList());

        List<Map<String, Object>> safeAuctions =
                auctionRepository.findAll().stream().map(a -> {

                    Map<String, Object> auctionMap = new HashMap<>();

                    auctionMap.put("id", a.getId());
                    auctionMap.put("productName", a.getProductName());
                    auctionMap.put("status", a.getStatus());
                    auctionMap.put("currentPrice", a.getCurrentPrice());

                    return auctionMap;

                }).collect(Collectors.toList());

        data.put("users", safeUsers);
        data.put("auctions", safeAuctions);

        return data;
    }

    // --------------------------------------------------------
    // 2. DELETE USER
    // --------------------------------------------------------
    @CacheEvict(value = "adminDashboard", allEntries = true)
    public ResponseEntity<String> deleteUser(Long id) {

        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(404)
                        .body("User not found");
            }

            userRepository.deleteById(id);

            return ResponseEntity.ok("User Deleted Successfully");

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Cannot delete user: Active history exists.");
        }
    }

    // --------------------------------------------------------
    // 3. DELETE AUCTION
    // --------------------------------------------------------
    @CacheEvict(value = {"auctionListings", "auctionDetails", "adminDashboard"}, allEntries = true)
    public ResponseEntity<Map<String, String>> deleteAuction(Long id) {

        Map<String, String> response = new HashMap<>();

        Auction auction = auctionRepository.findById(id).orElse(null);

        if (auction == null) {

            response.put("error", "Auction not found");

            return ResponseEntity.status(404).body(response);
        }

        if ("ACTIVE".equalsIgnoreCase(auction.getStatus())) {

            response.put(
                    "error",
                    "Action denied: You cannot delete an ongoing auction."
            );

            return ResponseEntity.badRequest().body(response);
        }

        if (auction.isPaid() || auction.getPayment() != null) {

            response.put(
                    "error",
                    "Action denied: Cannot delete an auction with completed payment history."
            );

            return ResponseEntity.badRequest().body(response);
        }

        try {

            auctionRepository.deleteById(id);

            FirebaseDatabase.getInstance()
                    .getReference("auctions/" + id)
                    .removeValueAsync();
            bloomFilterService.removeAuctionId(id);

            response.put(
                    "message",
                    "Auction and its bid history deleted successfully."
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {

            response.put(
                    "error",
                    "Cannot delete auction: Database constraints prevented deletion."
            );

            return ResponseEntity.badRequest().body(response);
        }
    }
}