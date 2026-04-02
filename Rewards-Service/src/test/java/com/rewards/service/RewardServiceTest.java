package com.rewards.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.rewards.client.WalletClient;
import com.rewards.dto.EarnPointsRequest;
import com.rewards.dto.RewardPointsDTO;
import com.rewards.entity.RewardPoints;
import com.rewards.entity.RewardRule;
import com.rewards.repository.*;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock
    private RewardRuleRepository ruleRepository;
    @Mock
    private RewardPointsRepository pointsRepository;
    @Mock
    private PointsTransactionRepository pointsTxRepository;
    @Mock
    private CatalogItemRepository catalogRepository;
    @Mock
    private RedemptionRepository redemptionRepository;
    @Mock
    private CampaignRepository campaignRepository;
    @Mock
    private WalletClient walletClient;

    @InjectMocks
    private RewardService rewardService;

    private RewardPoints rewardPoints;
    private RewardRule rewardRule;

    @BeforeEach
    void setUp() {
        // Set @Value fields manually
        ReflectionTestUtils.setField(rewardService, "silverMax", 999L);
        ReflectionTestUtils.setField(rewardService, "goldMax", 4999L);

        rewardPoints = RewardPoints.builder()
                .userId(1L)
                .availablePoints(100)
                .totalPoints(100)
                .lifetimePoints(100)
                .tier("SILVER")
                .build();

        rewardRule = RewardRule.builder()
                .name("Test Rule")
                .isActive(true)
                .transactionType("TRANSFER")
                .unitAmount(new BigDecimal("10.00"))
                .pointsPerUnit(1)
                .build();
    }

    @Test
    void testEarnPoints_Success() {
        EarnPointsRequest request = new EarnPointsRequest();
        request.setUserId(1L);
        request.setTransactionAmount(new BigDecimal("100.00"));
        request.setTransactionType("TRANSFER");

        when(ruleRepository.findByTransactionTypeAndIsActiveTrue("TRANSFER"))
                .thenReturn(Arrays.asList(rewardRule));
        when(pointsRepository.findByUserId(1L)).thenReturn(Optional.of(rewardPoints));
        when(campaignRepository.findByTriggerTypeAndIsActiveTrueAndStartDateBeforeAndEndDateAfter(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        RewardPointsDTO result = rewardService.earnPoints(request);

        assertNotNull(result);
        // 100 / 10 = 10 units. 10 * 1 = 10 points. 100 + 10 = 110.
        assertEquals(110L, result.getAvailablePoints());
        verify(pointsRepository, times(1)).save(any(RewardPoints.class));
    }

    @Test
    void testTierCalculation_Gold() {
        // Use Reflection to access private method or just test earnPoints with large amount
        ReflectionTestUtils.invokeMethod(rewardService, "calculateTier", 1500L);
        assertEquals("GOLD", ReflectionTestUtils.invokeMethod(rewardService, "calculateTier", 1500L));
        assertEquals("PLATINUM", ReflectionTestUtils.invokeMethod(rewardService, "calculateTier", 6000L));
    }
}
