package com.sentinel.management_api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "sentinel.kafka.enabled=false",
        "sentinel.ingest.key=test-ingest-key",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ManagementApiApplicationTests {

    @Test
    void contextLoads() {
    }
}
