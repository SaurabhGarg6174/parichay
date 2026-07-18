package com.aggarjan.patrika.parichay.modules.payment.controller;

import com.aggarjan.patrika.parichay.core.payload.ApiResponse;
import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentInitiateRequest;
import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentVerifyRequest;
import com.aggarjan.patrika.parichay.modules.payment.model.Payment;
import com.aggarjan.patrika.parichay.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<Payment>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.initiatePayment(request, principal.getName()),
                "Payment initiated successfully"));
    }

    @PostMapping("/{orderId}/verify")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(
            @PathVariable String orderId,
            @Valid @RequestBody PaymentVerifyRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.verifyPayment(orderId, request, principal.getName()),
                "Payment verified and profile activated successfully"));
    }
}
