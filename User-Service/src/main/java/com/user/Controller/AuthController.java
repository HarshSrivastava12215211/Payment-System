package com.user.Controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.user.Service.RegistrationService;
import com.user.dto.RegisterRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Authentication", description = "APIs for user registration, OTP requests, and login")
public class AuthController {
	

    private final RegistrationService authService;

    @PostMapping("/register")
    @io.swagger.v3.oas.annotations.Operation(summary = "Register a new user", description = "Creates a new user account with the provided details")
    public String register(@RequestBody RegisterRequest request) {
        log.info("Received registration request for email: {}", request.getEmail());
        String response = authService.register(request);
        log.info("Registration response for {}: {}", request.getEmail(), response);
        return response;
    }
    
    @PostMapping("/request-otp")
    @io.swagger.v3.oas.annotations.Operation(summary = "Request OTP", description = "Sends a 6-digit OTP to the user's email or phone")
    public String requestOtp(@io.swagger.v3.oas.annotations.Parameter(name = "identifier", description = "Email or phone number") @RequestParam("identifier") String identifier) {
        log.info("OTP request for identifier: {}", identifier);
        return authService.requestOtp(identifier);
    }

    @PostMapping("/Log-In")
    @io.swagger.v3.oas.annotations.Operation(summary = "Verify OTP & Login", description = "Verifies the OTP and returns a JWT token")
    public String verifyOtp(@io.swagger.v3.oas.annotations.Parameter(name = "identifier") @RequestParam("identifier") String identifier,
                            @io.swagger.v3.oas.annotations.Parameter(name = "otp") @RequestParam("otp") String otp) {
        log.info("Login attempt (OTP) for identifier: {}", identifier);
        return authService.verifyOtp(identifier, otp);
    }

    @PostMapping("/verify-registration")
    public String verifyRegistration(@RequestParam String identifier, @RequestParam String otp) {
        return authService.verifyRegistrationOtp(identifier, otp);
    }

    @PostMapping("/login-password")
    public String loginWithPassword(@RequestParam String identifier, @RequestParam String password) {
        return authService.loginWithPassword(identifier, password);
    }
}
