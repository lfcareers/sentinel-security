package com.sentinel.management_api.config;

import com.sentinel.management_api.account.SentinelUserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    @Profile("auth")
    SecurityFilterChain authenticated(
            HttpSecurity http,
            SentinelUserService users
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
                        .requestMatchers("/api/me", "/api/me/csrf").authenticated()
                        .anyRequest().denyAll())
                .oauth2Login(oauth -> oauth.successHandler(
                        (request, response, authentication) -> {
                            if (!(authentication.getPrincipal() instanceof OidcUser identity)) {
                                throw new IllegalStateException("Expected an OIDC identity");
                            }

                            users.recordSignIn(identity);
                            response.sendRedirect("/app");
                        }
                ))
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