package com.aggarjan.patrika.parichay.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for REST API simplicity (common practice for stateless/dev)
                .csrf(AbstractHttpConfigurer::disable)

                // Define access rules
                .authorizeHttpRequests(
                        auth -> auth.requestMatchers("/api/v1/profiles/submit").permitAll()
                                    .requestMatchers("/api/v1/profiles/directory").permitAll()
                                    .anyRequest().authenticated())

                // Enable Basic Auth for testing (Postman)
                .httpBasic(Customizer.withDefaults())

                // Enable Form Login for the Admin web interface
                .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
