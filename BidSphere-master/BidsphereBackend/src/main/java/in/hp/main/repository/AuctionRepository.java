package in.hp.main.repository;

import in.hp.main.model.Auction;
import in.hp.main.model.Users;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    // Lock an auction while updating its bid
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Auction findByIdForUpdate(@Param("id") Long id);

    // Find auctions by status
    List<Auction> findByStatus(String status);

    // Find auctions where the user is the highest bidder
    List<Auction> findByHighestBidder(Users user);

    // Find auctions created by a particular seller
    @Query("SELECT DISTINCT a FROM Auction a " +
            "LEFT JOIN FETCH a.category " +
            "LEFT JOIN FETCH a.payment " +
            "WHERE a.seller = :seller")
    List<Auction> findBySeller(@Param("seller") Users seller);

    // Find auctions whose start time is before the specified time
    List<Auction> findByStatusAndStartTimeBefore(
            String status,
            LocalDateTime time
    );

    // Find auctions whose end time is before the specified time
    List<Auction> findByStatusAndEndTimeBefore(
            String status,
            LocalDateTime time
    );

    // Get all auctions with database-level pagination
    @Override
    Page<Auction> findAll(Pageable pageable);

    // Search auctions by keyword and filter by status,
    // with database-level sorting and pagination
    @Query(
            value = "SELECT a FROM Auction a WHERE " +
                    "(:keyword IS NULL OR :keyword = '' OR " +
                    "LOWER(a.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:status IS NULL OR :status = '' OR a.status = :status)",

            countQuery = "SELECT COUNT(a) FROM Auction a WHERE " +
                    "(:keyword IS NULL OR :keyword = '' OR " +
                    "LOWER(a.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:status IS NULL OR :status = '' OR a.status = :status)"
    )
    Page<Auction> searchAndFilterAuctions(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT a.id FROM Auction a")
    List<Long> findAllAuctionIds();
}