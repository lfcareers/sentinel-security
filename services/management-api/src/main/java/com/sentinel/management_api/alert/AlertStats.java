package com.sentinel.management_api.alert;

public record AlertStats(
        long totalAlerts,
        long highSeverity,
        long criticalSeverity,
        double averageRiskScore,
        int highestRiskScore,
        long uniqueHosts
) {
}