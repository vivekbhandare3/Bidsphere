package in.hp.main.dto.request;

import in.hp.main.model.Role;
import lombok.Data;

@Data
public class RegisterSellerRequest {
    public String name;
    public String username;
    public String password;
    public Role role;
    public String email;
    public String address;
    public String businessName;
}
