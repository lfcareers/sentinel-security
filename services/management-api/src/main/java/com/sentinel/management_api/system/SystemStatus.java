package com.sentinel.management_api.system;

public record SystemStatus(
        String api,
        String database,
        String kafka
) {
}