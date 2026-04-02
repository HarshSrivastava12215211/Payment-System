package com.user.Config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.user.entity.User;
import com.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.email:admin@gmail.com}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:admin12345}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.name:System Admin}")
    private String adminName;

    @Value("${app.bootstrap.admin.phone:9999999999}")
    private String adminPhone;

    @Override
    public void run(ApplicationArguments args) {
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            boolean updated = false;

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                admin.setRole("ADMIN");
                updated = true;
            }
            if (!admin.isVerified()) {
                admin.setVerified(true);
                updated = true;
            }
            if (admin.isBlocked()) {
                admin.setBlocked(false);
                updated = true;
            }
            if (!admin.isKycApproved()) {
                admin.setKycApproved(true);
                updated = true;
            }
            if (!passwordEncoder.matches(adminPassword, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                updated = true;
            }
            if (admin.getName() == null || admin.getName().isBlank()) {
                admin.setName(adminName);
                updated = true;
            }
            if (admin.getPhone() == null || admin.getPhone().isBlank()) {
                admin.setPhone(resolveAdminPhone());
                updated = true;
            }

            if (updated) {
                userRepository.save(admin);
                log.info("Bootstrap admin account synchronized for {}", adminEmail);
            } else {
                log.info("Bootstrap admin account already present for {}", adminEmail);
            }
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .phone(resolveAdminPhone())
                .password(passwordEncoder.encode(adminPassword))
                .role("ADMIN")
                .isBlocked(false)
                .isKycApproved(true)
                .isVerified(true)
                .build();

        userRepository.save(admin);
        log.info("Bootstrap admin account created for {}", adminEmail);
    }

    private String resolveAdminPhone() {
        Optional<User> phoneOwner = userRepository.findByPhone(adminPhone);
        if (phoneOwner.isEmpty() || adminEmail.equalsIgnoreCase(phoneOwner.get().getEmail())) {
            return adminPhone;
        }

        String fallbackPhone = "9000000001";
        log.warn("Configured bootstrap admin phone {} is already in use. Falling back to {}", adminPhone, fallbackPhone);
        return fallbackPhone;
    }
}
