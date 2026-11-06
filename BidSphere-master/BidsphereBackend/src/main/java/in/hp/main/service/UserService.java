package in.hp.main.service;

import in.hp.main.dto.request.AuthRequest;
import in.hp.main.dto.request.RegisterSellerRequest;
import in.hp.main.dto.request.RegisterUserRequest;

import in.hp.main.dto.response.LoginResponseDTO;
import in.hp.main.dto.response.SellerResponse;
import in.hp.main.dto.response.UserResponse;

import in.hp.main.model.Role;
import in.hp.main.model.Seller;
import in.hp.main.model.Users;

import in.hp.main.model.type.AuthProviderType;

import in.hp.main.repository.UserRepository;
import in.hp.main.util.JwtUtil;

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    private final RefreshTokenService refreshTokenService;


    // ========================================================
    // 1. REGISTER USER
    // ========================================================

    public ResponseEntity<?> registerUserRequest(
            RegisterUserRequest request) {

        try {

            request.setRole(Role.USER);

            UserResponse userResponse = registerUser(
                    request,
                    null,
                    AuthProviderType.EMAIL
            );

            return ResponseEntity.ok(userResponse);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "User registration failed"
                    ));
        }
    }


    // ========================================================
    // 2. REGISTER SELLER
    // ========================================================

    public ResponseEntity<?> registerSellerRequest(
            RegisterSellerRequest request) {

        try {

            request.setRole(Role.SELLER);

            SellerResponse sellerResponse =
                    registerSeller(request);

            return ResponseEntity.ok(sellerResponse);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Seller registration failed"
                    ));
        }
    }


    // ========================================================
    // 3. REGISTER NORMAL USER
    // ========================================================

    public UserResponse registerUser(
            RegisterUserRequest registerUserRequest,
            String providerId,
            AuthProviderType authProviderType) {

        if (userRepository.findByUsername(
                registerUserRequest.getUsername()).isPresent()) {

            throw new RuntimeException("User already exists");
        }

        Users users = Users.builder()
                .username(registerUserRequest.getUsername())
                .name(registerUserRequest.getName())
                .role(registerUserRequest.getRole())
                .email(registerUserRequest.getEmail())
                .address(registerUserRequest.getAddress())
                .providerId(providerId)
                .providerType(authProviderType)
                .build();

        if (authProviderType == AuthProviderType.EMAIL) {

            users.setPassword(
                    passwordEncoder.encode(
                            registerUserRequest.getPassword()
                    )
            );
        }

        Users savedUsers = userRepository.save(users);

        return new UserResponse(
                savedUsers.getId(),
                savedUsers.getUsername(),
                savedUsers.getName(),
                savedUsers.getEmail(),
                savedUsers.getAddress(),
                savedUsers.getRole().name()
        );
    }


    // ========================================================
    // 4. REGISTER SELLER
    // ========================================================

    public SellerResponse registerSeller(
            RegisterSellerRequest registerSellerRequest) {

        if (userRepository.findByUsername(
                registerSellerRequest.getUsername()).isPresent()) {

            throw new RuntimeException("User already exists");
        }

        Users users = Users.builder()
                .username(registerSellerRequest.getUsername())
                .password(
                        passwordEncoder.encode(
                                registerSellerRequest.getPassword()
                        )
                )
                .role(registerSellerRequest.getRole())
                .name(registerSellerRequest.getName())
                .email(registerSellerRequest.getEmail())
                .address(registerSellerRequest.getAddress())
                .build();

        Seller seller = Seller.builder()
                .businessName(
                        registerSellerRequest.getBusinessName()
                )
                .build();

        seller.setUser(users);
        users.setSeller(seller);

        Users savedUsers = userRepository.save(users);

        return new SellerResponse(
                savedUsers.getId(),
                savedUsers.getUsername(),
                savedUsers.getName(),
                savedUsers.getEmail(),
                savedUsers.getSeller().getBusinessName(),
                savedUsers.getAddress(),
                savedUsers.getRole().name()
        );
    }


    // ========================================================
    // 5. LOGIN
    // ========================================================

    public ResponseEntity<?> login(AuthRequest authRequest) {

        try {

            // Authenticate username and password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()
                    )
            );

            // Generate refresh token
            String refreshToken =
                    refreshTokenService.createRefreshToken(
                            authRequest.getUsername()
                    );

            // Generate access token
            String jwt = jwtUtil.generateJwtToken(
                    authRequest.getUsername()
            );

            // Refresh token cookie
            ResponseCookie refreshCookie = ResponseCookie
                    .from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(Duration.ofDays(7))
                    .sameSite("Lax")
                    .build();

            // Access token cookie
            ResponseCookie accessCookie = ResponseCookie
                    .from("jwt", jwt)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(Duration.ofMinutes(2))
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.SET_COOKIE,
                            accessCookie.toString()
                    )
                    .header(
                            HttpHeaders.SET_COOKIE,
                            refreshCookie.toString()
                    )
                    .body("Login successful");

        } catch (AuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid username or password."
                    ));
        }
    }


    // ========================================================
    // 6. LOGOUT
    // ========================================================

    public ResponseEntity<?> logout() {

        // Clear access token cookie
        ResponseCookie accessCookie = ResponseCookie
                .from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        // Clear refresh token cookie
        ResponseCookie refreshCookie = ResponseCookie
                .from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        accessCookie.toString()
                )
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshCookie.toString()
                )
                .body("Logged out");
    }


    // ========================================================
    // 7. OAUTH2 LOGIN
    // ========================================================

    @Transactional
    public ResponseEntity<LoginResponseDTO> handleOAuth2LoginRequest(
            OAuth2User oAuth2User,
            String registrationId) {

        AuthProviderType providerType =
                jwtUtil.getProviderTypeFromRegistrationId(
                        registrationId
                );

        String providerId =
                jwtUtil.determineProviderIdFromOAuth2User(
                        oAuth2User,
                        registrationId
                );

        Users user = userRepository
                .findByProviderIdAndProviderType(
                        providerId,
                        providerType
                )
                .orElse(null);


        // Existing OAuth2 user
        if (user != null) {

            if (!user.isActive()) {
                throw new RuntimeException("Account is inactive");
            }

            if (user.isBlocked()) {
                throw new RuntimeException("Account is blocked");
            }
        }


        String email = oAuth2User.getAttribute("email");


        // Link an existing email account with OAuth2
        if (user == null && email != null) {

            Users emailUser = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (emailUser != null) {

                if (!emailUser.isActive()) {
                    throw new RuntimeException(
                            "Account is inactive"
                    );
                }

                if (emailUser.isBlocked()) {
                    throw new RuntimeException(
                            "Account is blocked"
                    );
                }

                emailUser.setProviderId(providerId);
                emailUser.setProviderType(providerType);

                user = userRepository.save(emailUser);
            }
        }


        // Register a completely new OAuth2 user
        if (user == null) {

            String username =
                    jwtUtil.determineUsernameFromOAuth2User(
                            oAuth2User,
                            providerId
                    );

            user = Users.builder()
                    .username(username)
                    .email(email)
                    .role(Role.USER)
                    .providerType(providerType)
                    .providerId(providerId)
                    .build();

            user = userRepository.save(user);
        }


        // Generate JWT
        String token = jwtUtil.generateJwtToken(
                user.getUsername()
        );

        return ResponseEntity.ok(
                new LoginResponseDTO(token)
        );
    }
}