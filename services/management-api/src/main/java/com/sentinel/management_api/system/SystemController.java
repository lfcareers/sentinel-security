package com.sentinel.management_api.system;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final JdbcTemplate jdbcTemplate;
    private final KafkaAdmin kafkaAdmin;

    public SystemController(
            JdbcTemplate jdbcTemplate,
            KafkaAdmin kafkaAdmin
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.kafkaAdmin = kafkaAdmin;
    }

    @GetMapping("/health")
    public SystemStatus health() {

        String database;

        try {
            jdbcTemplate.queryForObject(
                    "SELECT 1",
                    Integer.class
            );

            database = "UP";
        } catch (Exception exception) {
            database = "DOWN";
        }

        String kafka;

        try {
            kafkaAdmin.describeTopics(
                    "security.alert.generated"
            );

            kafka = "UP";
        } catch (Exception exception) {
            kafka = "DOWN";
        }

        return new SystemStatus(
                "UP",
                database,
                kafka
        );
    }
}