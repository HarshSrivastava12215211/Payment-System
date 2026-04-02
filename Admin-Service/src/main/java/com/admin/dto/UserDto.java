package com.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;

    @JsonProperty("isBlocked")
    private boolean blocked;

    @JsonProperty("isKycApproved")
    private boolean kycApproved;
}
