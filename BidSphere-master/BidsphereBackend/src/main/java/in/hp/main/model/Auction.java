package in.hp.main.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@Table(name="auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Version
    private Long version;
    private String productName;
    private String description;
    private Double startingPrice;
    private Double currentPrice;
    @ElementCollection
    @CollectionTable(name = "auction_images", joinColumns = @JoinColumn(name = "auction_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;
    private String status;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @ManyToOne
	@JsonIgnore
    @JoinColumn(name = "seller_id")
    @ToString.Exclude // Prevents infinite loop errors
    private Users seller;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Bid> bids;

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "highest_bidder_id")
	private Users highestBidder;

    @ManyToOne
	@JsonIgnore
    @JoinColumn(name = "category_id")
    @ToString.Exclude
    private Category category;

    @OneToOne(mappedBy = "auction", cascade = CascadeType.ALL)
    @ToString.Exclude
    private Payment payment;

    @com.fasterxml.jackson.annotation.JsonProperty("sellerName")
    public String getSellerName() {
        if (this.seller != null) {
            return this.seller.getUsername();
        }
        return "System";
    }

    // --- HELPER METHOD FOR THYMELEAF ---
    public boolean isPaid() {
        // This check prevents NullPointerException if payment is null
        return this.payment != null && "COMPLETED".equalsIgnoreCase(this.payment.getStatus());
    }
}