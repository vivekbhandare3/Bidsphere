package in.hp.main.controller;

import in.hp.main.service.ProfileService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    // 1. GET PROFILE
    @GetMapping
    @PreAuthorize("hasAuthority('PROFILE_READ')")
    public ResponseEntity<?> getProfile(
            Authentication authentication) {

        return profileService.getProfile(authentication);
    }

    // 2. REFRESH ACCESS TOKEN
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request) {

        return profileService.refreshToken(request);
    }
}