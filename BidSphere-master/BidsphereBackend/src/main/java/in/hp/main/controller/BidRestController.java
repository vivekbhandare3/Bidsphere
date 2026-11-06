package in.hp.main.controller;

import in.hp.main.model.Users;
import in.hp.main.service.BidRateLimitService;
import in.hp.main.service.BidService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class BidRestController {

    @Autowired
    private BidService bidService;

    @Autowired
    private BidRateLimitService bidRateLimitService;

    @PostMapping("/place-bid/{id}")
    @PreAuthorize("hasAuthority('BID_CREATE')")
    public ResponseEntity<Map<String, String>> placeBidAsync(
            @PathVariable Long id,
            @RequestParam Double amount,
            @AuthenticationPrincipal Users user) {

        // ADDED: Check the rate limit before processing the bid.
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User is not authenticated."));
        }

        // ADDED: Identify the user for rate limiting.
        // Assumes Users.getUsername() returns the user's unique username.
        String userId = user.getUsername();
        if (!bidRateLimitService.isAllowed(userId)) {
            return ResponseEntity.status(429).body(Map.of("error", "Too many bid requests. Please try again later."));
        }

// EXISTING CODE: Keep your current bid-processing logic below this point.
        return bidService.placeBid(id, user, amount);
    }
}