package com.aggarjan.patrika.parichay.modules.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentInitiateRequest(
        @NotNull(message = "Amount is required") @DecimalMin(value = "1.0", message = "Amount must be greater than 0") BigDecimal amount,

        String currency) {
}
