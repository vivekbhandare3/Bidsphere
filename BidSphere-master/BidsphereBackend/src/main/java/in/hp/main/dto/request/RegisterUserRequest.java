package in.hp.main.dto.request;

import in.hp.main.model.Role;
import lombok.Data;

@Data
public class RegisterUserRequest {
    public String username;
    public String name;
    public String password;
    public Role role;
    public String email;
    public String address;
}
