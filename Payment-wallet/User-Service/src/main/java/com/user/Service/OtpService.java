package com.user.Service;

import java.util.List;
import java.util.Random;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import com.user.entity.OTP;
import com.user.repository.OTPRepository;

import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {
	
	private final OTPRepository otpRepository;
	public String generateOtp(String identifier)
	{		
		
		String otp = String.valueOf(100000 + new Random().nextInt(900000));
		OTP otpEntity = new OTP();
		
		otpEntity.setIdentifier(identifier);
		otpEntity.setOtp(otp);
		otpEntity.setExpiryTime(System.currentTimeMillis()+ 5*60*1000); // 5 mins
		
		otpRepository.save(otpEntity);
		
		return otp;
	}
	
	/**
	 * Validates the provided OTP against the latest generated one for the identifier.
	 * 
	 * @param identifier The user's email or phone number.
	 * @param inputOtp The OTP entered by the user.
	 * @return true if valid, false otherwise.
	 */
	public boolean validateOtp(String identifier, String inputOtp)
	{
		 List<OTP> otps = otpRepository.findAllByIdentifier(identifier);

		    if (otps.isEmpty()) {
		        log.warn("No OTP found for identifier: {}", identifier);
		        return false;
		    }

		    // Get latest OTP (most recently saved)
		    OTP latestOtp = otps.get(otps.size() - 1);

		    if (latestOtp.getExpiryTime() < System.currentTimeMillis()) {
		        log.warn("OTP expired for identifier: {}", identifier);
		        return false;
		    }

		    return latestOtp.getOtp().equals(inputOtp);
	}
}
