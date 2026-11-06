package in.hp.main.controller;

import in.hp.main.dto.response.AuctionResponse;
import in.hp.main.service.AuctionBloomFilterService;
import in.hp.main.service.AuctionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class AuctionController {

    @Autowired
    private AuctionService auctionService;
    @Autowired
    private AuctionBloomFilterService bloomFilterService;
    // 1. VIEW ALL AUCTIONS
    @GetMapping("")
    public ResponseEntity<Page<AuctionResponse>> viewAll(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "All Status") String status,
            @RequestParam(required = false, defaultValue = "Newest First") String sortString,
            @RequestParam(required = false, defaultValue = "1") int pageNo,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {

        return ResponseEntity.ok(
                auctionService.viewAll(
                        keyword,
                        status,
                        sortString,
                        pageNo,
                        pageSize
                )
        );
    }

    // 2. GET AUCTION DETAILS
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAuctionDetails(
            @PathVariable Long id) {

        if (!bloomFilterService.mightExist(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Auction not found"
            );
        }
        try {
            Map<String, Object> response =
                    auctionService.getAuctionDetails(id);

            if (response == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(response);
        }catch (ResponseStatusException e){
            System.out.println("Service exception status: " + e.getStatusCode());
            throw e;
        }
    }
}