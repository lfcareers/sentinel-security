package com.sentinel.management_api.account;

import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Profile("auth")
@RequestMapping("/api/me")
public class MeController {

    private final SentinelUserService users;

    public MeController(SentinelUserService users) {
        this.users = users;
    }

    @GetMapping
    public Map<String, String> me(@AuthenticationPrincipal OidcUser identity) {
        SentinelUserEntity account = users.findAccount(identity);

        return Map.of(
                "userId", account.getUserId().toString(),
                "displayName", account.getDisplayName()
        );
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
                "parameterName", token.getParameterName(),
                "token", token.getToken()
        );
    }
}