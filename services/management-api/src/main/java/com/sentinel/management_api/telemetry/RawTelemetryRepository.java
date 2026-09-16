package com.sentinel.management_api.telemetry;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RawTelemetryRepository
        extends JpaRepository<RawTelemetryEntity, UUID> {

    List<RawTelemetryEntity> findAllByOrderByEventTimestampDesc(
            Pageable pageable
    );
}