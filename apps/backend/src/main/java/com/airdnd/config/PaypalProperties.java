package com.airdnd.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@ConfigurationProperties(prefix = "paypal")
public record PaypalProperties(
        String clientId,
        String clientSecret,
        String baseUrl,
        String currency,
        BigDecimal exchangeRate
) {}
