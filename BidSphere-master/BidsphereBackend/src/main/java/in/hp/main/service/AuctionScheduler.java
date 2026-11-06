package in.hp.main.service;

import in.hp.main.model.Auction;
import in.hp.main.repository.AuctionRepository;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class AuctionScheduler {

    @Autowired
    private AuctionRepository auctionRepository;

    @Scheduled(fixedRate = 60000)
    @SchedulerLock(name = "closeExpiredAuctions",lockAtMostFor = "PT5M",lockAtLeastFor = "PT0S")
    @Transactional
    public void updateAuctionStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Fetch ONLY 'UPCOMING' auctions whose start time has arrived
        List<Auction> toActivate = auctionRepository.findByStatusAndStartTimeBefore("UPCOMING", now);
        for (Auction auction : toActivate) {
            auction.setStatus("ACTIVE");
            syncFirebaseStatus(auction.getId(), "ACTIVE");
        }
        if (!toActivate.isEmpty()) {
            auctionRepository.saveAll(toActivate); // Bulk save!
        }

        // 2. Fetch ONLY 'ACTIVE' auctions whose end time has passed
        List<Auction> toEnd = auctionRepository.findByStatusAndEndTimeBefore("ACTIVE", now);
        for (Auction auction : toEnd) {
            auction.setStatus("ENDED");
            syncFirebaseStatus(auction.getId(), "ENDED");
        }
        if (!toEnd.isEmpty()) {
            auctionRepository.saveAll(toEnd); // Bulk save!
        }
        // ADDED: Log when the scheduled job begins executing.
        System.out.println(
                "Auction-closing scheduler executing on: "
                        + System.getenv("HOSTNAME")
        );
    }

    // Fire-and-forget Firebase update so the scheduler loop doesn't bottleneck
    private void syncFirebaseStatus(Long auctionId, String status) {
        CompletableFuture.runAsync(() -> {
            try {
                DatabaseReference ref = FirebaseDatabase.getInstance().getReference("auctions/" + auctionId);
                ref.child("status").setValueAsync(status);
            } catch (Exception e) {
                System.err.println("Firebase sync failed for auction " + auctionId);
            }
        });
    }
}