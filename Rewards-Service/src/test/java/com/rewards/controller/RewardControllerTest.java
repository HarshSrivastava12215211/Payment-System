package com.rewards.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.rewards.service.RewardService;
import com.rewards.dto.RewardPointsDTO;

@WebMvcTest(RewardsController.class)
@AutoConfigureMockMvc(addFilters = false)
class RewardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RewardService rewardService;

    @Test
    void testGetUserPoints_Success() throws Exception {
        RewardPointsDTO pointsDto = RewardPointsDTO.builder()
                .userId(1L)
                .availablePoints(500)
                .tier("GOLD")
                .build();

        when(rewardService.getUserPoints(anyLong())).thenReturn(pointsDto);

        mockMvc.perform(get("/api/rewards/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availablePoints").value(500))
                .andExpect(jsonPath("$.tier").value("GOLD"));
    }
}
