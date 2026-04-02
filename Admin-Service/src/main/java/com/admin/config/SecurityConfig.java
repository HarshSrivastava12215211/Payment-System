package com.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import lombok.RequiredArgsConstructor;
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	
	private final JwtFilter jwtFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

	    http.csrf(csrf -> csrf.disable())
	        .authorizeHttpRequests(auth -> auth

	            // ✅ Allow Swagger
	            .requestMatchers(
	                "/admin/v3/api-docs/**",
	                "/v3/api-docs/**",
	                "/swagger-ui/**",
	                "/swagger-ui.html"
	            ).permitAll()

	            // ✅ Temporarily allow all admin routes
	            .requestMatchers("/admin/**").permitAll()

	            // ❗ Everything else
	            .anyRequest().permitAll()
	        );
	        // .addFilterBefore( jwtFilter ,
	        //        UsernamePasswordAuthenticationFilter.class);;

	    return http.build();
	}
}