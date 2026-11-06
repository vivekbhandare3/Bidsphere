package in.hp.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String message = "Authentication successful";
    private String type = "Cookie";
    public LoginResponseDTO(String token) {
        this.token = token;
    }
}