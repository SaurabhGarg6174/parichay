package com.aggarjan.patrika.parichay.modules.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
        @NotBlank(message = "Order ID is required") String orderId,

        @NotBlank(message = "Payment ID (transaction ID) is required") String paymentId,

        // For manual simulation
        boolean success) {
}
