package com.sentinel.management_api.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SentinelUserRepository
        extends JpaRepository<SentinelUserEntity, UUID> {

    Optional<SentinelUserEntity> findByIssuerAndSubject(
            String issuer,
            String subject
    );
}