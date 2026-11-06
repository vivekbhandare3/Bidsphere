package in.hp.main.util;

import in.hp.main.model.type.AuthProviderType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtUtil {
    private final long EXPIRATION_TIME=1000*60*2;
    private final String SECRET="kjjsbiubak6516534a1cdkjsbckjnnskeubskdnbwjdlkjdnnfjwhdnkskjabsckjabdkjbadkj";
    private final SecretKey key= Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateJwtToken(String username){
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }
    public boolean validateToken(String username,UserDetails userDetails,String token){
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    public String extractUsername(String token){
        return extractClaims(token).getSubject();
    }
    public Claims extractClaims(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public boolean isTokenExpired(String token){
        return extractClaims(token).getExpiration().before(new Date());
    }


    public AuthProviderType getProviderTypeFromRegistrationId(String registrationId){
        return switch(registrationId.toLowerCase()){
            case "google"->AuthProviderType.GOOGLE;
            case "github"->AuthProviderType.GITHUB;
            default->throw new IllegalArgumentException("Unsupported OAuth2 provider:"+registrationId);
        };
    }
    public String determineProviderIdFromOAuth2User(OAuth2User oAuth2User,String registrationId){
        String providerId=switch(registrationId.toLowerCase()){
            case "google"->oAuth2User.getAttribute("sub");
            case "github"->oAuth2User.getAttribute("id").toString();
            default -> {
                log.error("Unsupported OAuth2 provider:{}",registrationId);
                throw new IllegalArgumentException("Unsupported OAuth2 provider:"+registrationId);
            }
        };
        if(providerId==null || providerId.isBlank()){
            log.error("Unsupported OAuth2 provider:{}",registrationId);
            throw new IllegalArgumentException("Unsupported OAuth2 provider:"+registrationId);
        }
        return providerId;
    }

    public String determineUsernameFromOAuth2User(OAuth2User oAuth2User,String providerId) {
        String email = oAuth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }
        return providerId;
    }
}