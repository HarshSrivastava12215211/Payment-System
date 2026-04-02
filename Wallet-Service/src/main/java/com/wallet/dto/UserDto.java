package com.wallet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
