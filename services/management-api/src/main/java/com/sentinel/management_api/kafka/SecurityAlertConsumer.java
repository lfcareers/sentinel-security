package com.sentinel.management_api.kafka;

import tools.jackson.databind.ObjectMapper;
import com.sentinel.management_api.alert.SecurityAlertEntity;
import com.sentinel.management_api.alert.SecurityAlertMessage;
import com.sentinel.management_api.alert.SecurityAlertRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SecurityAlertConsumer {

    private final ObjectMapper objectMapper;
    private final SecurityAlertRepository repository;

    public SecurityAlertConsumer(
            ObjectMapper objectMapper,
            SecurityAlertRepository repository
    ) {
        this.objectMapper = objectMapper;
        this.repository = repository;
    }

    @KafkaListener(
            topics = "security.alert.generated",
            groupId = "sentinel-management-api"
    )
    public void consume(String payload) throws Exception {

        SecurityAlertMessage message =
                objectMapper.readValue(payload, SecurityAlertMessage.class);

        SecurityAlertEntity entity =
                SecurityAlertEntity.from(message);

        repository.save(entity);
    }
}