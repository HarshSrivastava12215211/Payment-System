package com.user.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.user.repository.UserRepository;
import com.user.dto.RegisterRequest;
import com.user.entity.User;
import com.user.publisher.NotificationPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationService {

	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final OtpService otpService;
	private final EmailService emailService;
	private final NotificationPublisher notificationPublisher;

	
	public String register(RegisterRequest request)
	{
		log.info("Starting registration for email: {}", request.getEmail());
		if(userRepository.findByEmail(request.getEmail()).isPresent()) {
			log.warn("Registration failed: Email {} already exists", request.getEmail());
			throw new RuntimeException("User Already Exists");
		}

		
		if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already exists");
		}
		 
		User user = User.builder()
	                .name(request.getName())
	                .email(request.getEmail())
	                .phone(request.getPhone())
	                .password(passwordEncoder.encode(request.getPassword()))
	                .role("USER")
	                .isVerified(false)
	                .build();

	        userRepository.save(user);
	        
	        // Automatically send OTP for verification
	        requestOtp(user.getEmail());
	        
	        return "User Registered. Please verify OTP sent to your email/phone.";
	}
	
	public String requestOtp(String identifier)
	{
		//User user = userRepository.findByEmail(identifier).orElseGet(() -> userRepository.findByPhone(identifier).orElseThrow(() -> new RuntimeException("User Not found")));
		
		String otp = otpService.generateOtp(identifier);
		
		if(identifier.contains("@"))
		{
			emailService.sendOtp(identifier, otp);
		}
		else
		{
			// SMS Integration;
		}
		
		return "OTP Sent Succesfully";
	}
	
	// -> Verify Otp
	
	/**
	 * Verifies an OTP and returns a JWT token if successful.
	 * 
	 * @param identifier The user's email or phone number.
	 * @param otp The 6-digit one-time password.
	 * @return A JWT token for the authenticated user.
	 */
	public String verifyOtp(String identifier, String otp)
	{
		if(!otpService.validateOtp(identifier, otp))
		{
			throw new RuntimeException("Invalid OTP");
		}
		
		User user = userRepository.findByEmail(identifier)
			.or(() -> userRepository.findByPhone(identifier))
			.orElseThrow(() -> new RuntimeException("User not found: " + identifier));
			
		if (!user.isVerified()) {
			throw new RuntimeException("Please verify your account first via registration OTP");
		}
			
		try {
			notificationPublisher.sendLoginNotification(user.getEmail(), user.getId());
		} catch (Exception e) {
			log.warn("Login notification failed (non-critical, continuing login): {}", e.getMessage());
		}
		return jwtService.generateToken(user.getEmail(), user.getRole());
	}


	public String verifyRegistrationOtp(String identifier, String otp) {
		if(!otpService.validateOtp(identifier, otp)) {
			throw new RuntimeException("Invalid Verification OTP");
		}
		
		User user = userRepository.findByEmail(identifier)
			.or(() -> userRepository.findByPhone(identifier))
			.orElseThrow(() -> new RuntimeException("User not found"));
			
		user.setVerified(true);
		userRepository.save(user);
		return "Account Verified Successfully. Please Log In.";
	}

	public String loginWithPassword(String identifier, String password) {
		User user = userRepository.findByEmail(identifier)
			.or(() -> userRepository.findByPhone(identifier))
			.orElseThrow(() -> new RuntimeException("User not found"));
			
		if (!user.isVerified()) {
			throw new RuntimeException("Account not verified. Please verify using OTP.");
		}
		
		if (user.isBlocked()) {
			throw new RuntimeException("Account is blocked. Contact admin.");
		}
		
		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new RuntimeException("Invalid Password");
		}
		
		try {
			notificationPublisher.sendLoginNotification(user.getEmail(), user.getId());
		} catch (Exception e) {
			log.warn("Password login notification failed (non-critical, continuing login): {}", e.getMessage());
		}
		return jwtService.generateToken(user.getEmail(), user.getRole());
	}

	

}
