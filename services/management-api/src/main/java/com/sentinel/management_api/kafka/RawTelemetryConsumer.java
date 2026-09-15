package com.sentinel.management_api.kafka;

import com.sentinel.management_api.live.LiveEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "sentinel.kafka.enabled",
        havingValue = "true"
)
public class RawTelemetryConsumer {

    private static final Logger log =
            LoggerFactory.getLogger(RawTelemetryConsumer.class);

    private final LiveEventService liveEventService;

    public RawTelemetryConsumer(
            LiveEventService liveEventService
    ) {
        this.liveEventService = liveEventService;
    }

    @KafkaListener(
            topics = {
                    "security.endpoint.process",
                    "security.media.scan.request"
            },
            groupId = "sentinel-management-raw-telemetry"
    )
    public void consume(String payload) {

        log.debug(
                "Raw Sentinel telemetry received: {}",
                payload
        );

        liveEventService.publishRawTelemetry(payload);
    }
}