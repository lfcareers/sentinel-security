package com.sentinel.management_api.alert;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SecurityAlertRepository
        extends JpaRepository<SecurityAlertEntity, UUID> {
}