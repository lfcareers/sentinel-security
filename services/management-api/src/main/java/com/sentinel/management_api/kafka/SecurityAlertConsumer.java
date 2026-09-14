package com.sentinel.management_api.kafka;

import tools.jackson.databind.ObjectMapper;
import com.sentinel.management_api.alert.SecurityAlertEntity;
import com.sentinel.management_api.alert.SecurityAlertMessage;
import com.sentinel.management_api.alert.SecurityAlertRepository;
import com.sentinel.management_api.live.LiveEventService;
import com.sentinel.management_api.live.LiveSecurityEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SecurityAlertConsumer {

    private final ObjectMapper objectMapper;
    private final SecurityAlertRepository repository;
    private final LiveEventService liveEventService;

    public SecurityAlertConsumer(
            ObjectMapper objectMapper,
            SecurityAlertRepository repository,
            LiveEventService liveEventService
    ) {
        this.objectMapper = objectMapper;
        this.repository = repository;
        this.liveEventService = liveEventService;
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

        SecurityAlertEntity saved =
                repository.save(entity);

        liveEventService.publish(
                new LiveSecurityEvent(
                        saved.getAlertId().toString(),
                        saved.getSeverity(),
                        saved.getHostId(),
                        saved.getTitle(),
                        saved.getDescription(),
                        saved.getRiskScore(),
                        saved.getAction(),
                        saved.getCreatedAt()
                )
        );
    }
}