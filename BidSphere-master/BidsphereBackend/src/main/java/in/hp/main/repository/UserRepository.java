package in.hp.main.repository;

import in.hp.main.model.Users;
import in.hp.main.model.type.AuthProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    Users findByEmailAndPassword(String email, String password);
    Users findByName(String username);
    Optional<Users> findByUsername(String username);
    Optional<Users> findByProviderIdAndProviderType(String providerId, AuthProviderType providerType);
}