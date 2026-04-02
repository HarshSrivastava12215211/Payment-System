package com.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.user.entity.OTP;

import jakarta.transaction.Transactional;

public interface OTPRepository extends JpaRepository<OTP, Long> {
	
	List<OTP> findAllByIdentifier(String identifier);
	
	

}
