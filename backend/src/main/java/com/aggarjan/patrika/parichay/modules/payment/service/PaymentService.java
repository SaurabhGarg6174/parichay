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
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final UserRepository userRepository;
    private final ProfileService profileService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

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

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.amount().multiply(new java.math.BigDecimal("100")).intValue()); // amount in the smallest currency unit
            orderRequest.put("currency", request.currency() != null ? request.currency() : "INR");
            orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString().substring(0, 8));

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            Payment payment = Payment.builder()
                    .amount(request.amount())
                    .currency(request.currency() != null ? request.currency() : "INR")
                    .status(PaymentStatus.CREATED)
                    .provider("RAZORPAY")
                    .orderId(orderId)
                    .user(user)
                    .build();

            return paymentRepo.save(payment);
        } catch (RazorpayException e) {
            throw new BadRequestException("Failed to initiate payment: " + e.getMessage());
        }
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

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.orderId());
            options.put("razorpay_payment_id", request.paymentId());
            options.put("razorpay_signature", request.razorpaySignature());
            boolean status = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (status) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(request.paymentId());
                paymentRepo.save(payment);

                // AUTOMATICALLY ACTIVATE PROFILE
                profileService.activateProfile(userEmail);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepo.save(payment);
                throw new BadRequestException("Payment verification failed");
            }
        } catch (RazorpayException e) {
            throw new BadRequestException("Payment verification exception: " + e.getMessage());
        }

        return payment;
    }
}
