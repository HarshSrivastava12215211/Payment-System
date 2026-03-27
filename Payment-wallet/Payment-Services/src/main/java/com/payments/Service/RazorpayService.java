package com.payments.Service;

import com.payments.dto.RazorpayOrderRequest;
import com.payments.dto.RazorpayOrderResponse;
import com.payments.dto.RazorpayVerificationRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise
        orderRequest.put("amount", request.getAmount().multiply(new BigDecimal(100)).intValue());
        orderRequest.put("currency", request.getCurrency());
        orderRequest.put("receipt", request.getReceipt());

        Order order = razorpayClient.orders.create(orderRequest);

        return RazorpayOrderResponse.builder()
                .orderId(order.get("id"))
                .currency(order.get("currency"))
                .amount(order.get("amount"))
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
