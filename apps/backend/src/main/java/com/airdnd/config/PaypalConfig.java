package com.airdnd.config;


import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PaypalConfig {

    @Bean
    public RestClient paypalRestClient(PaypalProperties props) {
        // 연결/읽기 타임아웃을 둬 PayPal 소켓 행이 요청 스레드(및 capture 시 방 락·DB 커넥션)를
        // 무기한 잡지 못하게 한다.
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(props.connectTimeout())
                .withReadTimeout(props.readTimeout());

        return RestClient.builder()
                .baseUrl(props.baseUrl())
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
                .build();
    }
}
