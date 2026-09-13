package com.sentinel.management_api.alert;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SecurityAlertService {

    private final SecurityAlertRepository repository;

    public SecurityAlertService(SecurityAlertRepository repository) {
        this.repository = repository;
    }

    public List<AlertActivityPoint> getActivity(int hours) {

        // Prevent unreasonable requests.
        int safeHours = Math.max(1, Math.min(hours, 168));

        Instant now = Instant.now();
        Instant start = now.minus(safeHours, ChronoUnit.HOURS);

        // Retrieve alert timestamps from PostgreSQL.
        List<Instant> alertTimes =
                repository.findAlertTimesSince(start);

        // Create one bucket for every hour.
        Map<Instant, Long> buckets = new LinkedHashMap<>();

        Instant firstBucket =
                start.truncatedTo(ChronoUnit.HOURS);

        Instant finalBucket =
                now.truncatedTo(ChronoUnit.HOURS);

        for (
                Instant bucket = firstBucket;
                !bucket.isAfter(finalBucket);
                bucket = bucket.plus(1, ChronoUnit.HOURS)
        ) {
            buckets.put(bucket, 0L);
        }

        // Put each database alert into its corresponding hour.
        for (Instant alertTime : alertTimes) {

            Instant bucket =
                    alertTime.truncatedTo(ChronoUnit.HOURS);

            if (buckets.containsKey(bucket)) {
                buckets.put(
                        bucket,
                        buckets.get(bucket) + 1
                );
            }
        }

        // Convert the buckets into objects React can consume.
        return buckets.entrySet()
                .stream()
                .map(entry ->
                        new AlertActivityPoint(
                                entry.getKey(),
                                entry.getValue()
                        )
                )
                .toList();
    }
}