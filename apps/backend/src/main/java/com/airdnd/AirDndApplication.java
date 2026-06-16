package com.airdnd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class AirDndApplication {
    public static void main(String[] args) {
        SpringApplication.run(AirDndApplication.class, args);
    }
}
