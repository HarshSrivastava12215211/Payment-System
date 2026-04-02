package com.rewards.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;


import com.rewards.client.WalletClient;
import com.rewards.dto.*;
import com.rewards.entity.*;
import com.rewards.repository.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {


    private final RewardRuleRepository ruleRepository;
    private final RewardPointsRepository pointsRepository;
    private final PointsTransactionRepository pointsTxRepository;
    private final CatalogItemRepository catalogRepository;
    private final RedemptionRepository redemptionRepository;
    private final CampaignRepository campaignRepository;
    private final WalletClient walletClient;

    @Value("${rewards.tier.silver-max:999}")
    private long silverMax;

    @Value("${rewards.tier.gold-max:4999}")
    private long goldMax;

    @Value("${rewards.default.points-per-unit:1}")
    private int defaultPointsPerUnit;

    @Value("${rewards.default.unit-amount:100}")
    private BigDecimal defaultUnitAmount;

    // ========================
    // EARN POINTS
    // ========================

    @Transactional
    public RewardPointsDTO earnPoints(EarnPointsRequest request) {
        // 1. Find applicable rules
        List<RewardRule> rules = ruleRepository.findByTransactionTypeAndIsActiveTrue(request.getTransactionType());

        long totalPointsEarned = 0;

        if (rules.isEmpty()) {
            long fallbackPoints = calculateFallbackPoints(request.getTransactionAmount());
            if (fallbackPoints > 0) {
                totalPointsEarned += fallbackPoints;
                pointsTxRepository.save(PointsTransaction.builder()
                        .userId(request.getUserId())
                        .points(fallbackPoints)
                        .type(PointsTransactionType.EARN)
                        .description("Earned via default rule")
                        .referenceId(request.getTransactionId())
                        .build());
            }
        }

        for (RewardRule rule : rules) {
            long points = request.getTransactionAmount()
                    .divide(rule.getUnitAmount(), 0, RoundingMode.FLOOR)
                    .longValue() * rule.getPointsPerUnit();

            if (points > 0) {
                totalPointsEarned += points;

                // Create points transaction
                pointsTxRepository.save(PointsTransaction.builder()
                        .userId(request.getUserId())
                        .points(points)
                        .type(PointsTransactionType.EARN)
                        .description("Earned via rule: " + rule.getName())
                        .referenceId(request.getTransactionId())
                        .build());
            }
        }

        // 2. Check active campaigns
        LocalDateTime now = LocalDateTime.now();
        List<RewardCampaign> campaigns = campaignRepository
                .findByTriggerTypeAndIsActiveTrueAndStartDateBeforeAndEndDateAfter(
                        request.getTransactionType(), now, now);

        for (RewardCampaign campaign : campaigns) {
            if (campaign.getMaxRedemptions() == 0 || campaign.getCurrentRedemptions() < campaign.getMaxRedemptions()) {
                // Check tier eligibility if set
                RewardPoints userPoints = getOrCreateUserPoints(request.getUserId());
                if (campaign.getEligibleTier() == null || campaign.getEligibleTier().isEmpty()
                        || campaign.getEligibleTier().equals(userPoints.getTier())) {

                    totalPointsEarned += campaign.getBonusPoints();
                    campaign.setCurrentRedemptions(campaign.getCurrentRedemptions() + 1);
                    campaignRepository.save(campaign);

                    pointsTxRepository.save(PointsTransaction.builder()
                            .userId(request.getUserId())
                            .points(campaign.getBonusPoints())
                            .type(PointsTransactionType.BONUS)
                            .description("Campaign bonus: " + campaign.getName())
                            .referenceId(campaign.getId())
                            .build());
                }
            }
        }

        // 3. Update user points
        RewardPoints userPoints = getOrCreateUserPoints(request.getUserId());
        userPoints.setTotalPoints(userPoints.getTotalPoints() + totalPointsEarned);
        userPoints.setAvailablePoints(userPoints.getAvailablePoints() + totalPointsEarned);
        userPoints.setLifetimePoints(userPoints.getLifetimePoints() + totalPointsEarned);
        userPoints.setTier(calculateTier(userPoints.getLifetimePoints()));
        pointsRepository.save(userPoints);

        return toPointsDTO(userPoints);
    }

    // ========================
    // REDEEM POINTS
    // ========================

    @Transactional
    public RedemptionDTO redeem(RedeemRequest request) {
        RewardPoints userPoints = pointsRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("No points record found for user"));

        RewardCatalogItem item = catalogRepository.findById(request.getCatalogItemId())
                .orElseThrow(() -> new RuntimeException("Catalog item not found"));

        // Validate
        if (!item.isActive()) {
            throw new RuntimeException("This catalog item is no longer available");
        }
        if (item.getStock() <= 0) {
            throw new RuntimeException("This item is out of stock");
        }
        if (userPoints.getAvailablePoints() < item.getPointsCost()) {
            throw new RuntimeException("Insufficient points. Required: " + item.getPointsCost()
                    + ", Available: " + userPoints.getAvailablePoints());
        }
        if (item.getMinTier() != null && !item.getMinTier().isEmpty()) {
            if (!isTierEligible(userPoints.getTier(), item.getMinTier())) {
                throw new RuntimeException("Your tier (" + userPoints.getTier()
                        + ") does not meet minimum requirement: " + item.getMinTier());
            }
        }

        // Deduct points
        userPoints.setAvailablePoints(userPoints.getAvailablePoints() - item.getPointsCost());
        userPoints.setTotalPoints(userPoints.getTotalPoints() - item.getPointsCost());
        pointsRepository.save(userPoints);

        // Decrease stock
        item.setStock(item.getStock() - 1);
        catalogRepository.save(item);

        // Create points transaction (deduction)
        pointsTxRepository.save(PointsTransaction.builder()
                .userId(request.getUserId())
                .points(-item.getPointsCost())
                .type(PointsTransactionType.REDEEM)
                .description("Redeemed: " + item.getName())
                .referenceId(item.getId())
                .build());

        // Generate coupon code if type is COUPON
        String generatedCoupon = null;
        RedemptionStatus status = RedemptionStatus.COMPLETED;

        if ("COUPON".equals(item.getType())) {
            generatedCoupon = "CPN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else if ("CASHBACK".equals(item.getType())) {
            // Credit wallet with cashback
            creditWalletWithCashback(request.getUserId(), item.getPointsCost());
        }


        // Create redemption record
        Redemption redemption = Redemption.builder()
                .userId(request.getUserId())
                .catalogItemId(item.getId())
                .pointsSpent(item.getPointsCost())
                .status(status)
                .couponCode(generatedCoupon != null ? generatedCoupon : item.getCouponCode())
                .build();
        redemption = redemptionRepository.save(redemption);

        return RedemptionDTO.builder()
                .id(redemption.getId())
                .userId(redemption.getUserId())
                .catalogItemId(redemption.getCatalogItemId())
                .catalogItemName(item.getName())
                .pointsSpent(redemption.getPointsSpent())
                .status(redemption.getStatus().name())
                .couponCode(redemption.getCouponCode())
                .createdAt(redemption.getCreatedAt() != null ? redemption.getCreatedAt().toString() : null)
                .build();
    }

    // ========================
    // QUERIES
    // ========================

    public RewardPointsDTO getUserPoints(Long userId) {
        RewardPoints points = getOrCreateUserPoints(userId);
        return toPointsDTO(points);
    }

    public List<PointsTransactionDTO> getPointsHistory(Long userId) {
        return pointsTxRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toPointsTxDTO)
                .collect(Collectors.toList());
    }

    public List<CatalogItemDTO> getActiveCatalog() {
        return catalogRepository.findByIsActiveTrueAndStockGreaterThan(0).stream()
                .map(this::toCatalogDTO)
                .collect(Collectors.toList());
    }

    public List<CatalogItemDTO> getAllCatalog() {
        return catalogRepository.findAll().stream()
                .map(this::toCatalogDTO)
                .collect(Collectors.toList());
    }

    public List<RedemptionDTO> getUserRedemptions(Long userId) {
        return redemptionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> {
                    String itemName = catalogRepository.findById(r.getCatalogItemId())
                            .map(RewardCatalogItem::getName).orElse("Unknown");
                    return RedemptionDTO.builder()
                            .id(r.getId())
                            .userId(r.getUserId())
                            .catalogItemId(r.getCatalogItemId())
                            .catalogItemName(itemName)
                            .pointsSpent(r.getPointsSpent())
                            .status(r.getStatus().name())
                            .couponCode(r.getCouponCode())
                            .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ========================
    // RULES CRUD
    // ========================

    public List<RewardRuleDTO> getActiveRules() {
        return ruleRepository.findByIsActiveTrue().stream()
                .map(this::toRuleDTO)
                .collect(Collectors.toList());
    }

    public List<RewardRuleDTO> getAllRules() {
        return ruleRepository.findAll().stream()
                .map(this::toRuleDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardRuleDTO createRule(RewardRuleDTO dto) {
        RewardRule rule = RewardRule.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .pointsPerUnit(dto.getPointsPerUnit())
                .unitAmount(dto.getUnitAmount())
                .transactionType(dto.getTransactionType())
                .build();
        rule = ruleRepository.save(rule);
        return toRuleDTO(rule);
    }

    // ========================
    // CATALOG CRUD
    // ========================

    @Transactional
    public CatalogItemDTO createCatalogItem(CatalogItemDTO dto) {
        RewardCatalogItem item = RewardCatalogItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .pointsCost(dto.getPointsCost())
                .type(dto.getType())
                .couponCode(dto.getCouponCode())
                .stock(dto.getStock())
                .minTier(dto.getMinTier())
                .build();
        item = catalogRepository.save(item);
        return toCatalogDTO(item);
    }

    @Transactional
    public CatalogItemDTO updateCatalogItem(String id, CatalogItemDTO dto) {
        RewardCatalogItem item = catalogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catalog item not found"));

        if (dto.getName() != null) item.setName(dto.getName());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getPointsCost() > 0) item.setPointsCost(dto.getPointsCost());
        if (dto.getType() != null) item.setType(dto.getType());
        if (dto.getCouponCode() != null) item.setCouponCode(dto.getCouponCode());
        if (dto.getStock() >= 0) item.setStock(dto.getStock());
        if (dto.getMinTier() != null) item.setMinTier(dto.getMinTier());
        item.setActive(dto.isActive());

        item = catalogRepository.save(item);
        return toCatalogDTO(item);
    }

    // ========================
    // CAMPAIGN CRUD
    // ========================

    public List<CampaignDTO> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toCampaignDTO)
                .collect(Collectors.toList());
    }

    public List<CampaignDTO> getActiveCampaigns() {
        return campaignRepository.findByIsActiveTrue().stream()
                .map(this::toCampaignDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampaignDTO createCampaign(CampaignDTO dto) {
        RewardCampaign campaign = RewardCampaign.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .bonusPoints(dto.getBonusPoints())
                .triggerType(dto.getTriggerType())
                .startDate(LocalDateTime.parse(dto.getStartDate()))
                .endDate(LocalDateTime.parse(dto.getEndDate()))
                .maxRedemptions(dto.getMaxRedemptions())
                .eligibleTier(dto.getEligibleTier())
                .build();
        campaign = campaignRepository.save(campaign);
        return toCampaignDTO(campaign);
    }

    // ========================
    // REPORTS (for Admin)
    // ========================

    public long getTotalRedemptions() {
        return redemptionRepository.count();
    }

    public long getTotalPointsIssued() {
        return pointsRepository.findAll().stream()
                .mapToLong(RewardPoints::getLifetimePoints)
                .sum();
    }

    public java.util.Map<String, Long> getTierDistribution() {
        java.util.Map<String, Long> distribution = new java.util.HashMap<>();
        pointsRepository.findAll().forEach(p -> {
            distribution.merge(p.getTier(), 1L, Long::sum);
        });
        return distribution;
    }

    // ========================
    // SCHEDULED: Expire Points
    // ========================

    @Scheduled(cron = "0 0 2 * * *") // Run daily at 2 AM
    @Transactional
    public void expirePoints() {
        LocalDateTime now = LocalDateTime.now();
        List<PointsTransaction> expiring = pointsTxRepository
                .findByTypeAndExpiryDateBefore(PointsTransactionType.EARN, now);

        for (PointsTransaction ptx : expiring) {
            if (ptx.getPoints() > 0) {
                RewardPoints userPoints = pointsRepository.findByUserId(ptx.getUserId()).orElse(null);
                if (userPoints != null && userPoints.getAvailablePoints() >= ptx.getPoints()) {
                    userPoints.setAvailablePoints(userPoints.getAvailablePoints() - ptx.getPoints());
                    userPoints.setTotalPoints(userPoints.getTotalPoints() - ptx.getPoints());
                    pointsRepository.save(userPoints);

                    pointsTxRepository.save(PointsTransaction.builder()
                            .userId(ptx.getUserId())
                            .points(-ptx.getPoints())
                            .type(PointsTransactionType.EXPIRE)
                            .description("Points expired from transaction: " + ptx.getId())
                            .referenceId(ptx.getId())
                            .build());
                }
                // Mark original as zero to prevent re-processing
                ptx.setPoints(0);
                pointsTxRepository.save(ptx);
            }
        }
    }

    // ========================
    // RESILIENCE & HELPERS
    // ========================

    @CircuitBreaker(name = "rewardService", fallbackMethod = "handleWalletCreditFailure")
    public void creditWalletWithCashback(Long userId, long points) {
        log.info("Crediting wallet for cashback: user={}, points={}", userId, points);
        walletClient.credit(WalletOperationRequest.builder()
                .userId(userId)
                .amount(BigDecimal.valueOf(points))
                .currency("INR")
                .build());
    }

    public void handleWalletCreditFailure(Long userId, long points, Throwable t) {
        log.error("Failed to credit wallet for cashback. User: {}, Points: {}. Error: {}", 
                userId, points, t.getMessage());
        // In a real system, we might queue this for later retry or notify the admin
    }

    private RewardPoints getOrCreateUserPoints(Long userId) {

        return pointsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    RewardPoints rp = RewardPoints.builder()
                            .userId(userId)
                            .totalPoints(0)
                            .availablePoints(0)
                            .lifetimePoints(0)
                            .tier("SILVER")
                            .build();
                    return pointsRepository.save(rp);
                });
    }

    private String calculateTier(long lifetimePoints) {
        if (lifetimePoints >= goldMax + 1) return "PLATINUM";
        if (lifetimePoints >= silverMax + 1) return "GOLD";
        return "SILVER";
    }

    private boolean isTierEligible(String userTier, String requiredTier) {
        int userLevel = tierLevel(userTier);
        int requiredLevel = tierLevel(requiredTier);
        return userLevel >= requiredLevel;
    }

    private long calculateFallbackPoints(BigDecimal transactionAmount) {
        if (transactionAmount == null || transactionAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (defaultUnitAmount == null || defaultUnitAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        long calculated = transactionAmount
                .divide(defaultUnitAmount, 0, RoundingMode.FLOOR)
                .longValue() * defaultPointsPerUnit;
        return Math.max(1L, calculated);
    }

    private int tierLevel(String tier) {
        return switch (tier) {
            case "PLATINUM" -> 3;
            case "GOLD" -> 2;
            case "SILVER" -> 1;
            default -> 0;
        };
    }

    // ========================
    // MAPPERS
    // ========================

    private RewardPointsDTO toPointsDTO(RewardPoints p) {
        return RewardPointsDTO.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .totalPoints(p.getTotalPoints())
                .availablePoints(p.getAvailablePoints())
                .lifetimePoints(p.getLifetimePoints())
                .tier(p.getTier())
                .build();
    }

    private PointsTransactionDTO toPointsTxDTO(PointsTransaction ptx) {
        return PointsTransactionDTO.builder()
                .id(ptx.getId())
                .userId(ptx.getUserId())
                .points(ptx.getPoints())
                .type(ptx.getType().name())
                .description(ptx.getDescription())
                .referenceId(ptx.getReferenceId())
                .expiryDate(ptx.getExpiryDate() != null ? ptx.getExpiryDate().toString() : null)
                .createdAt(ptx.getCreatedAt() != null ? ptx.getCreatedAt().toString() : null)
                .build();
    }

    private CatalogItemDTO toCatalogDTO(RewardCatalogItem item) {
        return CatalogItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .pointsCost(item.getPointsCost())
                .type(item.getType())
                .couponCode(item.getCouponCode())
                .stock(item.getStock())
                .minTier(item.getMinTier())
                .isActive(item.isActive())
                .build();
    }

    private RewardRuleDTO toRuleDTO(RewardRule rule) {
        return RewardRuleDTO.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .pointsPerUnit(rule.getPointsPerUnit())
                .unitAmount(rule.getUnitAmount())
                .transactionType(rule.getTransactionType())
                .isActive(rule.isActive())
                .build();
    }

    private CampaignDTO toCampaignDTO(RewardCampaign c) {
        return CampaignDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .bonusPoints(c.getBonusPoints())
                .triggerType(c.getTriggerType())
                .startDate(c.getStartDate() != null ? c.getStartDate().toString() : null)
                .endDate(c.getEndDate() != null ? c.getEndDate().toString() : null)
                .maxRedemptions(c.getMaxRedemptions())
                .currentRedemptions(c.getCurrentRedemptions())
                .eligibleTier(c.getEligibleTier())
                .isActive(c.isActive())
                .build();
    }
}
