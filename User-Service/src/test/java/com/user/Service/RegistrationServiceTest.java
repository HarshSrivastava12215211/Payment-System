package com.user.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.user.dto.RegisterRequest;
import com.user.entity.User;
import com.user.publisher.NotificationPublisher;
import com.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationPublisher notificationPublisher;

    @InjectMocks
    private RegistrationService registrationService;

    private RegisterRequest registerRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPhone("1234567890");
        registerRequest.setPassword("password");

        user = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .phone("1234567890")
                .password("encodedPassword")
                .role("USER")
                .isVerified(false)
                .build();
    }

    @Test
    void testRegister_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByPhone(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(otpService.generateOtp(anyString())).thenReturn("123456");

        String response = registrationService.register(registerRequest);

        assertEquals("User Registered. Please verify OTP sent to your email/phone.", response);
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendOtp(anyString(), anyString());
    }

    @Test
    void testRegister_UserAlreadyExists() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> registrationService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginWithPassword_Success() {
        user.setVerified(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("mockToken");

        String token = registrationService.loginWithPassword("test@example.com", "password");

        assertEquals("mockToken", token);
        verify(notificationPublisher, times(1)).sendLoginNotification(anyString(), anyLong());
    }

    @Test
    void testLoginWithPassword_InvalidPassword() {
        user.setVerified(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> registrationService.loginWithPassword("test@example.com", "wrongPassword"));
    }

    @Test
    void testVerifyRegistrationOtp_Success() {
        when(otpService.validateOtp(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        String response = registrationService.verifyRegistrationOtp("test@example.com", "123456");

        assertEquals("Account Verified Successfully. Please Log In.", response);
        assertTrue(user.isVerified());
        verify(userRepository, times(1)).save(user);
    }
}
