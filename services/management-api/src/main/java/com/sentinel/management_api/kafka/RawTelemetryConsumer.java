package com.sentinel.management_api.kafka;

import com.sentinel.management_api.live.LiveEventService;
import com.sentinel.management_api.telemetry.RawTelemetryService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
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

    private final RawTelemetryService telemetryService;
    private final LiveEventService liveEventService;

    public RawTelemetryConsumer(
            RawTelemetryService telemetryService,
            LiveEventService liveEventService
    ) {
        this.telemetryService = telemetryService;
        this.liveEventService = liveEventService;
    }

    @KafkaListener(
            topics = {
                    "security.endpoint.process",
                    "security.media.scan.request"
            },
            groupId = "sentinel-management-raw-telemetry-v2"
    )
    public void consume(
            ConsumerRecord<String, String> record
    ) {
        String payload = record.value();

        log.info(
                "Telemetry received topic={} partition={} offset={}",
                record.topic(),
                record.partition(),
                record.offset()
        );

        telemetryService.persist(
                payload,
                record.topic(),
                record.partition(),
                record.offset()
        );

        liveEventService.publishRawTelemetry(payload);

        log.info(
                "Telemetry persisted topic={} partition={} offset={}",
                record.topic(),
                record.partition(),
                record.offset()
        );
    }
}