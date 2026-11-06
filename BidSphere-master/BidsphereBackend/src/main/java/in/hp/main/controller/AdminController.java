package in.hp.main.controller;

import in.hp.main.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 1. ADMIN DASHBOARD
    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('SYSTEM_READ')")
    public ResponseEntity<Map<String, Object>> dashboard() {

        return ResponseEntity.ok(adminService.dashboard());
    }

    // 2. DELETE USER
    @PostMapping("/delete-user/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        return adminService.deleteUser(id);
    }

    // 3. DELETE AUCTION
    @PostMapping("/delete-auction/{id}")
    @PreAuthorize("hasAuthority('ALL_AUCTION_MANAGE')")
    public ResponseEntity<Map<String, String>> deleteAuction(
            @PathVariable Long id) {

        return adminService.deleteAuction(id);
    }
}