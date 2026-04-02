package com.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class OTP {
	    @Id
	    @GeneratedValue
	    private Long id;

	    private String identifier; // email or phone
	    private String otp;

	    private long expiryTime;

}
