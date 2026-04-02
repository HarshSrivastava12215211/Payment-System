package com.admin.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.admin.client.*;
import com.admin.dto.*;
import com.admin.entity.AdminAction;
import com.admin.repository.AdminActionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserClient userClient;
    private final WalletClient walletClient;
    private final TransactionClient transactionClient;
    private final KycClient kycClient;
    private final PaymentClient paymentClient;
    private final RewardsClient rewardsClient;
    private final NotificationClient notificationClient;
    private final AdminActionRepository adminActionRepository;

    // ========================
    // USER MANAGEMENT
    // ========================

    public List<UserDto> getUsers() {
        return userClient.getAllUsers();
    }

    public void blockUser(Long userId) {
        userClient.blockUser(userId);
        walletClient.freezeWallet(userId);
        logAction("BLOCK_USER", userId, "User blocked and wallet frozen");
    }

    public void unblockUser(Long userId) {
        userClient.unblockUser(userId);
        walletClient.unfreezeWallet(userId);
        logAction("UNBLOCK_USER", userId, "User unblocked and wallet unfrozen");
    }

    public void approveKyc(Long userId) {
        try {
            kycClient.approveKyc(String.valueOf(userId));
        } catch (Exception e) {
            log.error("Failed to update KYC status in KycService for user: {}", userId, e);
            throw new RuntimeException("Failed to approve KYC in KYC service");
        }
        userClient.approveKyc(userId);
        logAction("APPROVE_KYC", userId, "KYC approved");
    }

    public void rejectKyc(Long userId) {
        try {
            kycClient.rejectKyc(String.valueOf(userId));
        } catch (Exception e) {
            log.error("Failed to update KYC status in KycService for user: {}", userId, e);
            throw new RuntimeException("Failed to reject KYC in KYC service");
        }
        userClient.rejectKyc(userId);
        logAction("REJECT_KYC", userId, "KYC rejected");
    }

    // ========================
    // KYC RECORDS
    // ========================

    public List<Object> getAllKycs() {
        return kycClient.getAllKycs();
    }

    // ========================
    // TRANSACTIONS
    // ========================

    public List<TransactionDto> getAllTransactions() {
        return transactionClient.getAllTransactions();
    }

    public List<TransactionDto> getSuspiciousTransactions() {
        return transactionClient.getSuspiciousTransactions();
    }

    // ========================
    // REWARDS MANAGEMENT
    // ========================

    /**
     * Creates a new reward rule in the Rewards-Service.
     * 
     * @param ruleDTO The rule definition.
     * @return The created rule.
     */
    public RewardRuleDTO createRewardRule(RewardRuleDTO ruleDTO) {
        RewardRuleDTO result = rewardsClient.createRule(ruleDTO);
        logAction("CREATE_REWARD_RULE", null, "Created new reward rule");
        return result;
    }

    public List<RewardRuleDTO> getActiveRules() {
        return rewardsClient.getActiveRules();
    }

    public CatalogItemDTO createCatalogItem(CatalogItemDTO catalogItemDTO) {
        CatalogItemDTO result = rewardsClient.createCatalogItem(catalogItemDTO);
        logAction("CREATE_CATALOG_ITEM", null, "Created new catalog item");
        return result;
    }

    public CatalogItemDTO updateCatalogItem(String id, CatalogItemDTO catalogItemDTO) {
        CatalogItemDTO result = rewardsClient.updateCatalogItem(id, catalogItemDTO);
        logAction("UPDATE_CATALOG_ITEM", null, "Updated catalog item: " + id);
        return result;
    }

    public List<CatalogItemDTO> getAllCatalog() {
        return rewardsClient.getAllCatalog();
    }

    public CampaignDTO createCampaign(CampaignDTO campaignDTO) {
        CampaignDTO result = rewardsClient.createCampaign(campaignDTO);
        logAction("CREATE_CAMPAIGN", null, "Created new campaign");
        return result;
    }

    public List<CampaignDTO> getAllCampaigns() {
        return rewardsClient.getAllCampaigns();
    }

    // ========================
    // REPORTS
    // ========================

    public Map<String, Object> getDashboardReport() {
        Map<String, Object> report = new HashMap<>();

        try {
            report.put("users", userClient.getAllUsers().size());
        } catch (Exception e) {
            report.put("users", "unavailable");
        }

        try {
            report.put("transactions", transactionClient.getAllTransactions().size());
        } catch (Exception e) {
            report.put("transactions", "unavailable");
        }

        try {
            report.put("suspiciousTransactions", transactionClient.getSuspiciousTransactions().size());
        } catch (Exception e) {
            report.put("suspiciousTransactions", "unavailable");
        }

        try {
            Map<String, Object> rewardsReport = rewardsClient.getReportsSummary();
            report.put("rewards", rewardsReport);
        } catch (Exception e) {
            report.put("rewards", "unavailable");
        }

        return report;
    }

    // ========================
    // AUDIT LOG
    // ========================

    public List<AdminActionDTO> getAuditLog() {
        return adminActionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private void logAction(String action, Long targetUserId, String details) {
        AdminAction adminAction = AdminAction.builder()
                .action(action)
                .targetUserId(targetUserId)
                .details(details)
                .build();
        adminActionRepository.save(adminAction);
    }

    private AdminActionDTO toDTO(AdminAction a) {
        return AdminActionDTO.builder()
                .id(a.getId())
                .adminId(a.getAdminId())
                .action(a.getAction())
                .targetUserId(a.getTargetUserId())
                .details(a.getDetails())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build();
    }
}
