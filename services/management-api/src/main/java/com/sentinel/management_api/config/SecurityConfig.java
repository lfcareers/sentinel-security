package com.sentinel.management_api.config;

import com.sentinel.management_api.account.SentinelUserService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    @Profile("auth")
    SecurityFilterChain authenticated(
            HttpSecurity http,
            SentinelUserService users,
            @Value("${sentinel.frontend-url}") String frontendUrl
    ) throws Exception {
        return http
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers(
                                "/actuator/health",
                                "/api/system/health",
                                "/oauth2/**",
                                "/login/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/ingest/alerts").permitAll()
                        .requestMatchers("/api/me", "/api/me/**").authenticated()
                        .requestMatchers("/api/board/posts", "/api/board/posts/mine").authenticated()
                        .anyRequest().denyAll())
                .oauth2Login(oauth -> oauth
                        .successHandler((request, response, authentication) -> {
                            if (!(authentication.getPrincipal() instanceof OidcUser identity)) {
                                throw new IllegalStateException("Expected an OIDC identity");
                            }

                            users.recordSignIn(identity);
                            response.sendRedirect(frontendUrl + "/app");
                        })
                        .failureHandler((request, response, exception) -> {
                            log.error("Sentinel OAuth login failed", exception);
                            response.sendRedirect("/login?error");
                        })
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/ingest/alerts"))
                .logout(logout -> logout.logoutSuccessUrl("/"))
                .exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
                        (request, response, error) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED),
                        request -> request.getRequestURI().startsWith("/api/")
                ))
                .build();
    }

    @Bean
    @Profile("!auth")
    SecurityFilterChain legacy(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/me", "/oauth2/**", "/login/**").denyAll()
                        .anyRequest().permitAll())
                .csrf(csrf -> csrf.disable())
                .build();
    }
}