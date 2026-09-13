package com.sentinel.management_api.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;
import java.time.Instant;

public interface SecurityAlertRepository
        extends JpaRepository<SecurityAlertEntity, UUID> {

    long countBySeverityIgnoreCase(String severity);

    @Query("""
        SELECT COUNT(DISTINCT a.hostId)
        FROM SecurityAlertEntity a
    """)
    long countUniqueHosts();

    @Query("""
        SELECT COALESCE(MAX(a.riskScore), 0)
        FROM SecurityAlertEntity a
    """)
    Integer findHighestRiskScore();

    @Query("""
        SELECT COALESCE(AVG(a.riskScore), 0)
        FROM SecurityAlertEntity a
    """)
    Double findAverageRiskScore();

    @Query("""
        SELECT
            a.hostId,
            COUNT(a),
            MAX(a.riskScore),
            MAX(a.createdAt)
        FROM SecurityAlertEntity a
        GROUP BY a.hostId
        ORDER BY MAX(a.createdAt) DESC
    """)
    List<Object[]> findEndpointSummaries();

    @Query("""
        SELECT a.createdAt
        FROM SecurityAlertEntity a
        WHERE a.createdAt >= :since
        ORDER BY a.createdAt ASC
        """)
    List<Instant> findAlertTimesSince(@Param("since") Instant since);

    List<SecurityAlertEntity>
    findTop10ByOrderByCreatedAtDesc();
}