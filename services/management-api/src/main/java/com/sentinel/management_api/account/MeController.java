package com.sentinel.management_api.account;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@Profile("auth")
@RequestMapping("/api/me")
public class MeController {

    private final SentinelUserService users;

    public MeController(SentinelUserService users) {
        this.users = users;
    }

    public record AccountResponse(
            UUID userId,
            String displayName,
            String boardDisplayName,
            boolean emailNotificationsEnabled
    ) {}

    public record SettingsRequest(
            String boardDisplayName,
            boolean emailNotificationsEnabled
    ) {}

    @GetMapping
    public AccountResponse me(@AuthenticationPrincipal OidcUser identity) {
        return response(users.findAccount(identity));
    }

    @PutMapping("/settings")
    public AccountResponse updateSettings(
            @AuthenticationPrincipal OidcUser identity,
            @RequestBody SettingsRequest request
    ) {
        return response(users.updateSettings(
                identity,
                request.boardDisplayName(),
                request.emailNotificationsEnabled()
        ));
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String, String> invalidSettings(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage());
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
                "parameterName", token.getParameterName(),
                "token", token.getToken()
        );
    }

    private AccountResponse response(SentinelUserEntity user) {
        return new AccountResponse(
                user.getUserId(),
                user.getDisplayName(),
                user.getBoardDisplayName(),
                user.isEmailNotificationsEnabled()
        );
    }
}