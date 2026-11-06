package in.hp.main.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bids")
@AllArgsConstructor
@NoArgsConstructor // Required for database instantiation
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "auction_id")
    private Auction auction;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "bidder_id")
    private Users bidder;

    private Double amount;
    private LocalDateTime bidTime;

    @com.fasterxml.jackson.annotation.JsonProperty("bidderName")
    public String getBidderName() {
        if (this.bidder != null) {
            return this.bidder.getUsername();
        }
        return "Unknown User";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public Users getBidder() { return bidder; }
    public void setBidder(Users bidder) { this.bidder = bidder; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }
}