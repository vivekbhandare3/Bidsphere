package in.hp.main.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {
    @GetMapping("/api/csrf")
    public CsrfToken getCsrfToken(CsrfToken csrfToken) {
        if (csrfToken != null) {
            System.out.println("CSRF token exists: " + csrfToken.getToken());
        } else {
            System.out.println("CSRF token is null");
        }
        return csrfToken;
    }
}