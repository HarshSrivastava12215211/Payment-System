package com.user.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
	
	private final JavaMailSender mailSender;
	
	@org.springframework.scheduling.annotation.Async
	public void sendOtp(String email, String otp)
	{
		System.out.println("DEBUG: Sending OTP [" + otp + "] to email: " + email);
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(email);
		message.setSubject("Login OTP");
		message.setText("Your OTP is: " + otp);
		
		try {
			mailSender.send(message);
			System.out.println("DEBUG: OTP sent successfully to " + email);
		} catch (Exception e) {
			System.err.println("ERROR: Failed to send OTP to " + email + ": " + e.getMessage());
		}
	}

}
