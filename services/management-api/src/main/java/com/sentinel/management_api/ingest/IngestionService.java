package com.sentinel.management_api.ingest;

import com.sentinel.management_api.alert.SecurityAlertEntity;
import com.sentinel.management_api.alert.SecurityAlertMessage;
import com.sentinel.management_api.alert.SecurityAlertRepository;
import com.sentinel.management_api.live.LiveEventService;
import com.sentinel.management_api.live.LiveSecurityEvent;
import org.springframework.stereotype.Service;

@Service
public class IngestionService {

    private final SecurityAlertRepository repository;
    private final LiveEventService liveEventService;

    public IngestionService(
            SecurityAlertRepository repository,
            LiveEventService liveEventService
    ) {
        this.repository = repository;
        this.liveEventService = liveEventService;
    }

    public SecurityAlertEntity ingest(SecurityAlertMessage message) {

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

        return saved;
    }
}