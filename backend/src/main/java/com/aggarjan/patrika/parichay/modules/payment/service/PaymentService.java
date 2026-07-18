package com.aggarjan.patrika.parichay.modules.payment.service;

import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentInitiateRequest;
import com.aggarjan.patrika.parichay.modules.payment.dto.PaymentVerifyRequest;
import com.aggarjan.patrika.parichay.modules.payment.model.Payment;

public interface PaymentService {
    Payment initiatePayment(PaymentInitiateRequest request, String userEmail);

    Payment verifyPayment(String orderId, PaymentVerifyRequest request, String userEmail);
}
