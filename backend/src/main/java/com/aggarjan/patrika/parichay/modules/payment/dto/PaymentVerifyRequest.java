package com.aggarjan.patrika.parichay.modules.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
        @NotBlank(message = "Payment ID (transaction ID) is required") String paymentId,

        @NotBlank(message = "Razorpay Signature is required") String razorpaySignature
) {
}
