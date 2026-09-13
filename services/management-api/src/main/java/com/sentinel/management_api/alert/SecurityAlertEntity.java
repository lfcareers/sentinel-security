package com.sentinel.management_api.alert;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_alerts")
public class SecurityAlertEntity {

    @Id
    @Column(name = "alert_id", nullable = false)
    private UUID alertId;

    @Column(name = "source_event_id", nullable = false)
    private UUID sourceEventId;

    @Column(name = "rule_id", nullable = false, length = 128)
    private String ruleId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "risk_score", nullable = false)
    private short riskScore;

    @Column(name = "severity", nullable = false, length = 32)
    private String severity;

    @Column(name = "host_id", nullable = false, length = 255)
    private String hostId;

    @Column(name = "process_id")
    private Long processId;

    @Column(name = "action", nullable = false, length = 32)
    private String action;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public SecurityAlertEntity() {
    }

    public static SecurityAlertEntity from(SecurityAlertMessage message) {
        SecurityAlertEntity entity = new SecurityAlertEntity();

        entity.setAlertId(message.alertId());
        entity.setSourceEventId(message.sourceEventId());
        entity.setRuleId(message.ruleId());
        entity.setTitle(message.title());
        entity.setDescription(message.description());
        entity.setRiskScore(message.riskScore());
        entity.setSeverity(message.severity());
        entity.setHostId(message.hostId());
        entity.setProcessId(message.processId());
        entity.setAction(message.action());
        entity.setCreatedAt(message.timestamp());

        return entity;
    }

    public UUID getAlertId() {
        return alertId;
    }

    public void setAlertId(UUID alertId) {
        this.alertId = alertId;
    }

    public UUID getSourceEventId() {
        return sourceEventId;
    }

    public void setSourceEventId(UUID sourceEventId) {
        this.sourceEventId = sourceEventId;
    }

    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public short getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(short riskScore) {
        this.riskScore = riskScore;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getHostId() {
        return hostId;
    }

    public void setHostId(String hostId) {
        this.hostId = hostId;
    }

    public Long getProcessId() {
        return processId;
    }

    public void setProcessId(Long processId) {
        this.processId = processId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}