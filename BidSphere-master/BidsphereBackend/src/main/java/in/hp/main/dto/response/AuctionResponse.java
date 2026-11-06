package in.hp.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuctionResponse {
    private Long id;
    private String productName;
    private String description;
    private Double currentPrice;
    private String status;
    private String sellerName;
    private String categoryName;
    private List<String> imageUrls;
    private Object payment;
    private String startTime;
    private String endTime;
    private String winnerName;
}