package in.hp.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String businessName;
    private String address;
    private String role;
}
