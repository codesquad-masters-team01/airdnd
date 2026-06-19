package com.airdnd.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.math.BigDecimal;
import java.time.Duration;

@ConfigurationProperties(prefix = "paypal")
public record PaypalProperties(
        String clientId,
        String clientSecret,
        String baseUrl,
        String currency,
        BigDecimal exchangeRate,
        // PayPal HTTP 타임아웃. capture 는 방 비관적 락을 잡은 채 호출되므로,
        // 읽기 타임아웃으로 락 보유 시간의 상한을 둔다(소켓 행 방지).
        @DefaultValue("5s") Duration connectTimeout,
        @DefaultValue("10s") Duration readTimeout
) {}
