package com.sentinel.management_api.account;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class SentinelUserService {

    private final SentinelUserRepository repository;

    public SentinelUserService(SentinelUserRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SentinelUserEntity recordSignIn(OidcUser identity) {
        String issuer = identity.getIssuer().toString();
        String subject = identity.getSubject();

        String name = identity.getFullName();
        if (name == null || name.isBlank()) {
            name = "Sentinel member";
        }
        final String displayName =
                name.length() > 255 ? name.substring(0, 255) : name;

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        SentinelUserEntity user = repository.findByIssuerAndSubject(issuer, subject)
                .orElseGet(() -> new SentinelUserEntity(
                        UUID.randomUUID(),
                        issuer,
                        subject,
                        displayName,
                        now
                ));

        user.recordSignIn(displayName, now);
        return repository.save(user);
    }

    @Transactional(readOnly = true)
    public SentinelUserEntity findAccount(OidcUser identity) {
        return repository.findByIssuerAndSubject(
                identity.getIssuer().toString(),
                identity.getSubject()
        ).orElseThrow(() -> new IllegalStateException(
                "Authenticated identity has no Sentinel account"
        ));
    }

    @Transactional
    public SentinelUserEntity updateSettings(
            OidcUser identity,
            String boardDisplayName,
            boolean emailNotificationsEnabled
    ) {
        String name = boardDisplayName == null ? "" : boardDisplayName.trim();

        if (name.length() > 80 || name.chars().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException(
                    "Board display name must be at most 80 characters and contain no control characters"
            );
        }

        SentinelUserEntity user = findAccount(identity);
        user.updateSettings(name.isEmpty() ? null : name, emailNotificationsEnabled);
        return repository.save(user);
    }
}