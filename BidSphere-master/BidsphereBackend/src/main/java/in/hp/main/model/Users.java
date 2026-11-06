package in.hp.main.model;
import in.hp.main.model.type.AuthProviderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String name;
    @Column(unique = true)
    private String email;

    private String password;
    private String address;
    @Enumerated(EnumType.STRING)
    private Role role; // "USER", "SELLER", "ADMIN"
    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean blocked = false;

    @OneToOne(mappedBy = "user",cascade=CascadeType.ALL,fetch = FetchType.LAZY)
    private Seller seller;

    private String providerId;
    @Enumerated(EnumType.STRING)
    private AuthProviderType providerType;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<SimpleGrantedAuthority> authorities=new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_"+role.name()));
        Set<SimpleGrantedAuthority> permissionAuthorities=role.getPermissions().stream()
                .map(permissions -> new SimpleGrantedAuthority(permissions.name()))
                .collect(Collectors.toSet());
        authorities.addAll(permissionAuthorities);
        return authorities;
    }

}