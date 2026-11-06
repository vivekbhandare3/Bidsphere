
package in.hp.main.service;

import in.hp.main.dto.response.AuctionResponse;
import in.hp.main.model.Auction;
import in.hp.main.model.Bid;
import in.hp.main.model.Category;
import in.hp.main.model.Users;
import in.hp.main.repository.AuctionRepository;
import in.hp.main.repository.BidRepository;
import in.hp.main.repository.CategoryRepository;
import in.hp.main.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SellerService {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionBloomFilterService bloomFilterService;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private S3Service s3Service;

    // Local image storage directory
    private final String UPLOAD_DIR =
            "src/main/resources/static/uploads/";

    // Storage configuration
    @Value("${app.storage.type:local}")
    private String storageType;

    private boolean isProduction() {
        return "s3".equalsIgnoreCase(storageType);
    }

    // --------------------------------------------------------
    // 1. ADD PRODUCT
    // --------------------------------------------------------

    @CacheEvict(
            value = {"auctionListings", "adminDashboard"},
            allEntries = true
    )
    public ResponseEntity<?> addProduct(
            String productName,
            String description,
            Double startingPrice,
            String startTimeStr,
            String endTimeStr,
            Long categoryId,
            List<MultipartFile> imageFiles,
            Authentication authentication) {

        List<String> savedImageUrls = new ArrayList<>();

        try {

            if (imageFiles == null || imageFiles.size() != 3) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Exactly 3 images are required."
                        ));
            }

            String username = authentication.getName();

            Users seller = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("Seller account not found"));

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() ->
                            new RuntimeException("Category not found"));

            // Local upload directory
            Path uploadPath = Paths.get(UPLOAD_DIR)
                    .toAbsolutePath()
                    .normalize();

            if (!isProduction()) {
                Files.createDirectories(uploadPath);
            }

            // Upload images
            for (MultipartFile file : imageFiles) {

                if (file.isEmpty()) {
                    throw new IllegalArgumentException(
                            "One of the uploaded images is empty."
                    );
                }

                String fileName = UUID.randomUUID()
                        + "_" + Paths.get(
                        file.getOriginalFilename() == null
                                ? "image"
                                : file.getOriginalFilename()
                ).getFileName();

                if (isProduction()) {

                    // AWS S3 upload
                    String key = s3Service.uploadFile(file);

                    savedImageUrls.add(key);

                } else {

                    // Local image upload
                    Path filePath = uploadPath.resolve(fileName);

                    Files.copy(
                            file.getInputStream(),
                            filePath,
                            StandardCopyOption.REPLACE_EXISTING
                    );

                    // Store only filename in database
                    savedImageUrls.add(fileName);

                    System.out.println(
                            "Local image saved: " + filePath
                    );
                }
            }

            // Create auction
            Auction auction = new Auction();

            auction.setProductName(productName);
            auction.setDescription(description);
            auction.setStartingPrice(startingPrice);
            auction.setCurrentPrice(startingPrice);

            auction.setStartTime(
                    LocalDateTime.parse(startTimeStr)
            );

            auction.setEndTime(
                    LocalDateTime.parse(endTimeStr)
            );

            auction.setCategory(category);
            auction.setSeller(seller);

            if (LocalDateTime.now().isBefore(auction.getStartTime())) {
                auction.setStatus("UPCOMING");
            } else {
                auction.setStatus("ACTIVE");
            }

            auction.setImageUrls(savedImageUrls);

            // Save auction in MySQL
            Auction savedAuction = auctionRepository.save(auction);

            // Add auction ID to Bloom Filter
            bloomFilterService.addAuctionId(savedAuction.getId());

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Auction created successfully with 3 images!"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "An unexpected error occurred"
                    ));
        }
    }

    // --------------------------------------------------------
    // 2. SELLER DASHBOARD
    // --------------------------------------------------------

    public ResponseEntity<?> getSellerDashboard(
            Authentication authentication) {

        try {

            String username = authentication.getName();

            Users seller = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("Seller not found"));

            List<Auction> sellerAuctions =
                    auctionRepository.findBySeller(seller);

            List<AuctionResponse> responses =
                    sellerAuctions.stream()
                            .map(a -> {

                                AuctionResponse response =
                                        new AuctionResponse(
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
                                                        ? a.getImageUrls()
                                                        : null,

                                                a.getPayment(),

                                                a.getStartTime() != null
                                                        ? a.getStartTime().toString()
                                                        : "",

                                                a.getEndTime() != null
                                                        ? a.getEndTime().toString()
                                                        : "",

                                                null
                                        );

                                List<Bid> bids =
                                        bidRepository.findByAuctionOrderByBidTimeDesc(a);

                                if (bids != null && !bids.isEmpty()) {

                                    response.setWinnerName(
                                            bids.get(0).getBidder().getUsername()
                                    );

                                } else {

                                    response.setWinnerName("No Bids Placed");
                                }

                                return response;

                            })
                            .collect(Collectors.toList());

            return ResponseEntity.ok(responses);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "An unexpected error occurred"
                    ));
        }
    }

    // --------------------------------------------------------
    // 3. DELETE AUCTION
    // --------------------------------------------------------

    @CacheEvict(
            value = {
                    "auctionListings",
                    "auctionDetails",
                    "adminDashboard"
            },
            allEntries = true
    )
    public ResponseEntity<?> deleteAuction(
            Long id,
            Authentication authentication) {

        try {

            String username = authentication.getName();

            Auction auction = auctionRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Auction not found"));

            if (!auction.getSeller().getUsername().equals(username)) {

                return ResponseEntity.status(403)
                        .body(Map.of(
                                "error",
                                "You do not have permission to delete this auction."
                        ));
            }

            auctionRepository.delete(auction);

            // Remove auction ID from Bloom Filter
            bloomFilterService.removeAuctionId(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Auction deleted successfully."
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "An unexpected error occurred"
                    ));
        }
    }
}
