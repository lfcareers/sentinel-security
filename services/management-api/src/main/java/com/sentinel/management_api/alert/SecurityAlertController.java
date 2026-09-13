package com.sentinel.management_api.alert;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class SecurityAlertController {

    private final SecurityAlertRepository repository;

    public SecurityAlertController(SecurityAlertRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SecurityAlertEntity> getAlerts() {
        return repository.findAll(
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }
}