package in.hp.main.repository;

import in.hp.main.model.Auction;
import in.hp.main.model.Payment;
import in.hp.main.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Payment findByAuction(Auction auction);

    List<Payment> findByUser(Users user);
}