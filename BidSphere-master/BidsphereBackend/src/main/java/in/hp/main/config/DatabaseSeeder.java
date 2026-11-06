package in.hp.main.config;

import in.hp.main.model.Role;
import in.hp.main.model.Users;
import in.hp.main.model.type.AuthProviderType;
import in.hp.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin already exists so we don't duplicate it on every restart
            if (userRepository.findByUsername("admin").isEmpty()) {
                Users admin = Users.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123")) // Set a strong password!
                        .name("System Administrator")
                        .email("admin@bidsphere.com")
                        .role(Role.ADMIN)
                        .providerType(AuthProviderType.EMAIL)
                        .build();

                userRepository.save(admin);
                System.out.println("✅ Admin account created successfully.");
            }
        };
    }
}