package in.hp.main.controller;

import in.hp.main.dto.request.AuthRequest;
import in.hp.main.dto.request.RegisterSellerRequest;
import in.hp.main.dto.request.RegisterUserRequest;
import in.hp.main.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        },
        allowCredentials = "true"
)
public class UserController {

    @Autowired
    private UserService userService;

    // REGISTER USER
    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(
            @RequestBody RegisterUserRequest request) {

        return userService.registerUserRequest(request);
    }

    // REGISTER SELLER
    @PostMapping("/register/seller")
    public ResponseEntity<?> registerSeller(
            @RequestBody RegisterSellerRequest request) {

        return userService.registerSellerRequest(request);
    }

    // LOGIN
    @PostMapping("/authenticate")
    public ResponseEntity<?> generateToken(
            @RequestBody AuthRequest authRequest) {

        return userService.login(authRequest);
    }

    // LOGOUT
    @PostMapping("/api/logout")
    public ResponseEntity<?> logout() {

        return userService.logout();
    }
}