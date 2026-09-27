package com.sentinel.management_api.account;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sentinel_users")
public class SentinelUserEntity {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "issuer", nullable = false, length = 255)
    private String issuer;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Column(name = "board_display_name", length = 80)
    private String boardDisplayName;

    @Column(name = "email_notifications_enabled", nullable = false)
    private boolean emailNotificationsEnabled;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_sign_in_at", nullable = false)
    private OffsetDateTime lastSignInAt;

    protected SentinelUserEntity() {
    }

    public SentinelUserEntity(
            UUID userId,
            String issuer,
            String subject,
            String displayName,
            OffsetDateTime createdAt
    ) {
        this.userId = userId;
        this.issuer = issuer;
        this.subject = subject;
        this.displayName = displayName;
        this.createdAt = createdAt;
        this.lastSignInAt = createdAt;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void recordSignIn(String displayName, OffsetDateTime signedInAt) {
        this.displayName = displayName;
        this.lastSignInAt = signedInAt;
    }

    public String getBoardDisplayName() {
        return boardDisplayName;
    }

    public boolean isEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public void updateSettings(
            String boardDisplayName,
            boolean emailNotificationsEnabled
    ) {
        this.boardDisplayName = boardDisplayName;
        this.emailNotificationsEnabled = emailNotificationsEnabled;
    }
}