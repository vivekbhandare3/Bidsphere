package in.hp.main.repository;

import in.hp.main.model.Bid;
import in.hp.main.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    @Query("""
        SELECT b FROM Bid b
        LEFT JOIN FETCH b.bidder
        WHERE b.auction.id = :auctionId
        ORDER BY b.bidTime DESC
        """)
    List<Bid> findBidHistoryByAuctionId(
            @Param("auctionId") Long auctionId
    );
    List<Bid> findByAuctionOrderByBidTimeDesc(Auction auction);
}