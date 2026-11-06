package in.hp.main.repository;

import in.hp.main.model.RefreshToken;
import in.hp.main.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Ref;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Integer>{
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUserInfo(Users user);
}
