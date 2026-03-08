package com.aggarjan.patrika.parichay.modules.payment.service;

import com.aggarjan.patrika.parichay.core.exception.BadRequestException;
import com.aggarjan.patrika.parichay.core.exception.ResourceNotFoundException;
import com.aggarjan.patrika.parichay.modules.auth.model.User;
import com.aggarjan.patrika.parichay.modules.auth.repo.UserRepository;
import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentInitiateRequest;
import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentVerifyRequest;
import com.aggarjan.patrika.parichay.modules.payment.model.Payment;
import com.aggarjan.patrika.parichay.modules.payment.model.PaymentStatus;
import com.aggarjan.patrika.parichay.modules.payment.repo.PaymentRepo;
import com.aggarjan.patrika.parichay.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final UserRepository userRepository;
    private final ProfileService profileService;

    @Transactional
    public Payment initiatePayment(PaymentInitiateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Ensure user has a profile first
        try {
            profileService.getMyBioData(userEmail);
        } catch (ResourceNotFoundException e) {
            throw new BadRequestException("Please submit your bio-data before making a payment.");
        }

        // Generate a fake Order ID (In real world, call Razorpay/Stripe API here)
        String orderId = "ORD_" + UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .amount(request.amount())
                .currency(request.currency() != null ? request.currency() : "INR")
                .status(PaymentStatus.CREATED)
                .provider("MANUAL_SIMULATION") // or RAZORPAY
                .orderId(orderId)
                .user(user)
                .build();

        return paymentRepo.save(payment);
    }

    @Transactional
    public Payment verifyPayment(PaymentVerifyRequest request, String userEmail) {
        Payment payment = paymentRepo.findByOrderId(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment Order not found: " + request.orderId()));

        if (!payment.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Payment does not belong to user");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment already processed");
        }

        // Simulate Verification Logic
        // In real world, verify signature using secret

        if (request.success()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(request.paymentId());
            paymentRepo.save(payment);

            // AUTOMATICALLY ACTIVATE PROFILE
            profileService.activateProfile(userEmail);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(payment);
        }

        return payment;
    }
}
