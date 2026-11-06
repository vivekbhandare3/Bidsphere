package in.hp.main.controller;

import in.hp.main.model.Auction;
import in.hp.main.model.Payment;
import in.hp.main.model.Users;
import in.hp.main.repository.AuctionRepository;
import in.hp.main.repository.PaymentRepository;
import in.hp.main.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PaymentController {

    @Autowired private AuctionRepository auctionRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UserRepository userRepository;
    @GetMapping("/payment/check/{id}")
    @PreAuthorize("hasAuthority('BID_READ')")
    public ResponseEntity<?> checkPaymentEligibility(@PathVariable Long id, @AuthenticationPrincipal Users user) {
        Auction auction = auctionRepository.findById(id).orElse(null);

        if (auction == null || auction.getHighestBidder() == null || !auction.getHighestBidder().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error","Unauthorized to view this payment page"));
        }
        if (!"ENDED".equals(auction.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You can only make a payment after the auction has completely ended."));
        }

        if (auction.isPaid()) {
            // FIX: Added 'auction' to the return payload so the receipt can display the product name
            return ResponseEntity.ok(Map.of("status", "already_paid", "payment", auction.getPayment(), "auction", auction));
        }
        return ResponseEntity.ok(auction);
    }

    @PostMapping("/payment/process/{id}")
    @PreAuthorize("hasAuthority('BID_READ')")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestParam String method, @AuthenticationPrincipal Users user) {
        Auction auction = auctionRepository.findById(id).orElse(null);

        if (auction == null || !auction.getHighestBidder().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized."));
        }

        if (!"ENDED".equals(auction.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot process payment. Auction is still active."));
        }

        Payment payment = new Payment();
        Users fullUser = userRepository.findById(user.getId()).orElse(user);
        payment.setUser(fullUser);
        payment.setAuction(auction);
        payment.setAmount(auction.getCurrentPrice());
        payment.setPaymentMethod(method); // Ensure 'method' parameter is not null!
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setStatus("COMPLETED");

        paymentRepository.save(payment);

        // FIX: Return the exact same JSON structure as the /check endpoint
        return ResponseEntity.ok(Map.of(
                "status", "already_paid",
                "payment", payment,
                "auction", auction
        ));
    }
    }