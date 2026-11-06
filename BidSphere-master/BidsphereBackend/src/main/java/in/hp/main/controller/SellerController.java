
package in.hp.main.controller;

import in.hp.main.dto.response.AuctionResponse;
import in.hp.main.service.SellerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class SellerController {

    @Autowired
    private SellerService sellerService;

    // 1. ADD PRODUCT
    @PostMapping("/seller/add-product")
    @PreAuthorize("hasAuthority('AUCTION_CREATE')")
    public ResponseEntity<?> addProduct(
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("startingPrice") Double startingPrice,
            @RequestParam("startTimeStr") String startTimeStr,
            @RequestParam("endTimeStr") String endTimeStr,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("imageFiles") List<MultipartFile> imageFiles,
            Authentication authentication
    ) {
        return sellerService.addProduct(
                productName,
                description,
                startingPrice,
                startTimeStr,
                endTimeStr,
                categoryId,
                imageFiles,
                authentication
        );
    }

    // 2. SELLER DASHBOARD
    @GetMapping("/seller/dashboard")
    @PreAuthorize("hasAuthority('AUCTION_CREATE')")
    public ResponseEntity<?> getSellerDashboard(
            Authentication authentication) {

        return sellerService.getSellerDashboard(authentication);
    }

    // 3. DELETE AUCTION
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('AUCTION_DELETE')")
    public ResponseEntity<?> deleteAuction(
            @PathVariable Long id,
            Authentication authentication) {

        return sellerService.deleteAuction(id, authentication);
    }
}