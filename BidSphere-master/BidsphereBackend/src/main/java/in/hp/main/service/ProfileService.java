package in.hp.main.service;

import in.hp.main.dto.response.AuctionResponse;
import in.hp.main.model.RefreshToken;
import in.hp.main.model.Users;

import in.hp.main.repository.AuctionRepository;
import in.hp.main.repository.UserRepository;
import in.hp.main.util.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JwtUtil jwtUtil;

    // --------------------------------------------------------
    // 1. GET PROFILE
    // --------------------------------------------------------
    public ResponseEntity<?> getProfile(
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized access."));
        }

        String usernameOrEmail = authentication.getName();

        Users user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() ->
                        new RuntimeException("User profile session not found"));

        List<AuctionResponse> safeWonAuctions =
                auctionRepository.findAll().stream()

                        .filter(a ->
                                a.getHighestBidder() != null
                                        && a.getHighestBidder().getId()
                                        .equals(user.getId())
                                        && "ENDED".equalsIgnoreCase(a.getStatus())
                        )

                        .map(a -> {

                            Object paymentData = null;

                            if (a.getPayment() != null) {
                                paymentData = Map.of(
                                        "amount", a.getPayment().getAmount(),
                                        "transactionId",
                                        a.getPayment().getTransactionId()
                                );
                            }

                            return new AuctionResponse(
                                    a.getId(),
                                    a.getProductName(),
                                    a.getDescription(),
                                    a.getCurrentPrice(),
                                    a.getStatus(),

                                    a.getSeller() != null
                                            ? a.getSeller().getUsername()
                                            : "Unknown",

                                    a.getCategory() != null
                                            ? a.getCategory().getName()
                                            : "Uncategorized",

                                    a.getImageUrls() != null
                                            && !a.getImageUrls().isEmpty()
                                            ? a.getImageUrls()
                                            : null,

                                    paymentData,

                                    a.getStartTime() != null
                                            ? a.getStartTime().toString()
                                            : "",

                                    a.getEndTime() != null
                                            ? a.getEndTime().toString()
                                            : "",

                                    null
                            );
                        })

                        .collect(Collectors.toList());

        Map<String, Object> userData = Map.of(
                "username", user.getUsername(),
                "name", user.getName() != null
                        ? user.getName() : "User",
                "role", user.getRole().name(),
                "email", user.getEmail() != null
                        ? user.getEmail() : "",
                "address", user.getAddress() != null
                        ? user.getAddress() : "",
                "businessName",
                user.getSeller() != null
                        && user.getSeller().getBusinessName() != null
                        ? user.getSeller().getBusinessName()
                        : ""
        );

        return ResponseEntity.ok(
                Map.of(
                        "user", userData,
                        "wonAuctions", safeWonAuctions
                )
        );
    }

    // --------------------------------------------------------
    // 2. REFRESH ACCESS TOKEN
    // --------------------------------------------------------
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request) {

        String refreshToken = null;

        // Extract refresh token from cookie
        if (request.getCookies() != null) {

            for (Cookie cookie : request.getCookies()) {

                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        // Check refresh token availability
        if (refreshToken == null || refreshToken.isBlank()) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Refresh Token Missing");
        }

        // Find refresh token in database
        RefreshToken token = refreshTokenService
                .findByToken(refreshToken)
                .orElse(null);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Refresh Token not found");
        }

        // Validate token expiration
        try {
            refreshTokenService.verifyExpiration(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Refresh Token expired");
        }

        // Generate a new access token
        String jwt = jwtUtil.generateJwtToken(
                token.getUserInfo().getUsername()
        );

        // Create HTTP-only access-token cookie
        ResponseCookie accessCookie = ResponseCookie
                .from("jwt", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(1))
                .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        accessCookie.toString()
                )
                .body("Access Token Refreshed");
    }
}