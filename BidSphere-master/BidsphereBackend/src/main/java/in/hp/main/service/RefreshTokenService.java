package in.hp.main.service;

import in.hp.main.model.RefreshToken;
import in.hp.main.model.Users;
import in.hp.main.repository.RefreshTokenRepository;
import in.hp.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Ref;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private UserRepository userRepository;
    public String createRefreshToken(String username){
        Users user = userRepository.findByName(username);
        RefreshToken refreshToken=refreshTokenRepository.findByUserInfo(user)
                .orElse(new RefreshToken());
        refreshToken.setUserInfo(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryTime(Instant.now().plusMillis(600000));
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken refreshToken) {
        if(refreshToken.getExpiryTime().isBefore(Instant.now())){
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh Token Expired");
        }
        return refreshToken;
    }
}
