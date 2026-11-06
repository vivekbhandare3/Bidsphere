package in.hp.main.service;

import in.hp.main.model.Auction;
import in.hp.main.model.Bid;
import in.hp.main.model.Users;
import in.hp.main.repository.AuctionRepository;
import in.hp.main.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
@Service
public class BidTransactionService {
    @Autowired private AuctionRepository auctionRepository;
    @Autowired private BidRepository bidRepository;
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String executeDbTransaction(Long auctionId, Users bidder, Double bidAmount) {
        Auction auction = auctionRepository.findByIdForUpdate(auctionId);
        if (auction == null || auction.getStartTime() == null) return "Auction not found.";

        LocalDateTime now = LocalDateTime.now();

        if (auction.getSeller() != null && auction.getSeller().getId().equals(bidder.getId())) {
            return "You cannot bid on your own product.";
        }

        if (bidder.getRole() != null) {
            if ("SELLER".equalsIgnoreCase(bidder.getRole().name())) return "Seller accounts are not eligible to place bids.";
            if ("ADMIN".equalsIgnoreCase(bidder.getRole().name())) return "Admin accounts are not eligible to place bids.";
        }

        if (now.isBefore(auction.getStartTime())) return "Bidding for this item has not started yet.";
        if (now.isAfter(auction.getEndTime())) return "This auction has already closed.";
        if (bidAmount <= auction.getCurrentPrice()) return "Your bid must be higher than the current price.";

        auction.setCurrentPrice(bidAmount);

        auction.setHighestBidder(bidder);

        auctionRepository.save(auction);

        Bid newBid = new Bid();
        newBid.setAuction(auction);
        newBid.setBidder(bidder);
        newBid.setAmount(bidAmount);
        newBid.setBidTime(now);
        bidRepository.save(newBid);

        return "SUCCESS";
    }
}
