package com.aggarjan.patrika.parichay.modules.payment.repo;

import com.aggarjan.patrika.parichay.modules.payment.model.Payment;
import com.aggarjan.patrika.parichay.modules.payment.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {
    List<Payment> findByUser_Id(Long userId);

    Optional<Payment> findByOrderId(String orderId);

    List<Payment> findByStatus(PaymentStatus status);
}
