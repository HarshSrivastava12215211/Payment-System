package com.rewards.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rewards.dto.*;
import com.rewards.service.RewardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
@Tag(name = "rewards-controller", description = "Operations related to Rewards and Points")
public class RewardsController {




    private final RewardService rewardService;

    // ========================
    // EARN & REDEEM
    // ========================

    @Operation(summary = "Earn points for a transaction")
    @PostMapping("/earn")
    public ResponseEntity<RewardPointsDTO> earnPoints(@Valid @RequestBody EarnPointsRequest request) {
        RewardPointsDTO result = rewardService.earnPoints(request);
        return ResponseEntity.ok(result);
    }


    @Operation(summary = "Calculate potential reward for an amount")
    @PostMapping("/calculate")
    public RewardPointsDTO calculateReward(@Valid @RequestBody EarnPointsRequest request) {
        log.info("Calculating reward for user ID: {}, amount: {}", request.getUserId(), request.getTransactionAmount());
        RewardPointsDTO response = rewardService.earnPoints(request);
        log.info("Reward calculated for user ID: {}: {}", request.getUserId(), response.getAvailablePoints());
        return response;
    }



    @Operation(summary = "Redeem points for an item")
    @PostMapping("/redeem")
    public ResponseEntity<RedemptionDTO> redeem(@Valid @RequestBody RedeemRequest request) {
        RedemptionDTO result = rewardService.redeem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }


    // ========================
    // POINTS & HISTORY
    // ========================

    @Operation(summary = "Get user points summary")
    @GetMapping("/points/{userId}")
    public ResponseEntity<RewardPointsDTO> getUserPoints(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getUserPoints(userId));
    }


    @GetMapping("/history/{userId}")
    public ResponseEntity<List<PointsTransactionDTO>> getPointsHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getPointsHistory(userId));
    }

    @GetMapping("/redemptions/{userId}")
    public ResponseEntity<List<RedemptionDTO>> getUserRedemptions(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getUserRedemptions(userId));
    }

    // ========================
    // CATALOG
    // ========================

    @Operation(summary = "Get active reward catalog")
    @GetMapping("/catalog")
    public ResponseEntity<List<CatalogItemDTO>> getActiveCatalog() {
        return ResponseEntity.ok(rewardService.getActiveCatalog());
    }

    @Operation(summary = "Get all catalog items (including inactive)")
    @GetMapping("/catalog/all")
    public ResponseEntity<List<CatalogItemDTO>> getAllCatalog() {
        return ResponseEntity.ok(rewardService.getAllCatalog());
    }


    @PostMapping("/catalog")
    public ResponseEntity<CatalogItemDTO> createCatalogItem(@Valid @RequestBody CatalogItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rewardService.createCatalogItem(dto));
    }

    @PutMapping("/catalog/{id}")
    public ResponseEntity<CatalogItemDTO> updateCatalogItem(@PathVariable String id, @RequestBody CatalogItemDTO dto) {
        return ResponseEntity.ok(rewardService.updateCatalogItem(id, dto));
    }

    // ========================
    // RULES
    // ========================

    @Operation(summary = "Get active reward rules")
    @GetMapping("/rules")
    public ResponseEntity<List<RewardRuleDTO>> getActiveRules() {
        return ResponseEntity.ok(rewardService.getActiveRules());
    }

    @Operation(summary = "Get all reward rules")
    @GetMapping("/rules/all")
    public ResponseEntity<List<RewardRuleDTO>> getAllRules() {
        return ResponseEntity.ok(rewardService.getAllRules());
    }


    @PostMapping("/rules")
    public ResponseEntity<RewardRuleDTO> createRule(@Valid @RequestBody RewardRuleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rewardService.createRule(dto));
    }

    // ========================
    // CAMPAIGNS
    // ========================

    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignDTO>> getActiveCampaigns() {
        return ResponseEntity.ok(rewardService.getActiveCampaigns());
    }

    @GetMapping("/campaigns/all")
    public ResponseEntity<List<CampaignDTO>> getAllCampaigns() {
        return ResponseEntity.ok(rewardService.getAllCampaigns());
    }

    @PostMapping("/campaigns")
    public ResponseEntity<CampaignDTO> createCampaign(@Valid @RequestBody CampaignDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rewardService.createCampaign(dto));
    }

    // ========================
    // REPORTS (Admin)
    // ========================

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getReportsSummary() {
        Map<String, Object> report = new java.util.HashMap<>();
        report.put("totalRedemptions", rewardService.getTotalRedemptions());
        report.put("totalPointsIssued", rewardService.getTotalPointsIssued());
        report.put("tierDistribution", rewardService.getTierDistribution());
        return ResponseEntity.ok(report);
    }
}
