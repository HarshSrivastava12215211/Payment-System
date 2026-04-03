package com.payments.Service;

import com.payments.dto.RazorpayOrderRequest;
import com.payments.dto.RazorpayOrderResponse;
import com.payments.dto.RazorpayVerificationRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) throws RazorpayException {
        if (razorpayClient == null) {
            throw new RazorpayException("Razorpay client not initialized. Check API key and secret configuration.");
        }
        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (1 INR = 100 paise)
        orderRequest.put("amount", request.getAmount().multiply(new BigDecimal(100)).longValue());
        orderRequest.put("currency", request.getCurrency());
        orderRequest.put("receipt", request.getReceipt());

        Order order = razorpayClient.orders.create(orderRequest);

        return RazorpayOrderResponse.builder()
                .orderId(order.get("id"))
                .currency(order.get("currency"))
                .amount(((Number) order.get("amount")).longValue())
                .status(order.get("status"))
                .build();
    }

    public boolean verifyPayment(RazorpayVerificationRequest request) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        return Utils.verifyPaymentSignature(options, apiSecret);
    }
}
