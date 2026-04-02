package com.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.admin.dto.*;
import com.admin.service.AdminService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin Operations", description = "Management APIs for users, rewards, and system-wide monitoring")
public class AdminController {


    private final AdminService adminService;

    // ========================
    // USER MANAGEMENT
    // ========================

    @GetMapping("/users")
    public List<UserDto> getUsers() {
        return adminService.getUsers();
    }

    @PutMapping("/users/{id}/block")
    public String blockUser(@PathVariable Long id) {
        adminService.blockUser(id);
        return "User blocked successfully";
    }

    @PutMapping("/users/{id}/unblock")
    public String unblockUser(@PathVariable Long id) {
        adminService.unblockUser(id);
        return "User unblocked successfully";
    }

    @PutMapping("/users/{id}/kyc/approve")
    public String approveKyc(@PathVariable Long id) {
        adminService.approveKyc(id);
        return "KYC approved successfully";
    }

    @PutMapping("/users/{id}/kyc/reject")
    public String rejectKyc(@PathVariable Long id) {
        adminService.rejectKyc(id);
        return "KYC rejected successfully";
    }

    // ========================
    // KYC
    // ========================

    @GetMapping("/kyc/all")
    public List<Object> getAllKycs() {
        return adminService.getAllKycs();
    }

    // ========================
    // TRANSACTIONS
    // ========================

    @GetMapping("/transactions")
    public List<TransactionDto> getTransactions() {
        return adminService.getAllTransactions();
    }

    @GetMapping("/transactions/suspicious")
    public List<TransactionDto> getSuspiciousTransactions() {
        return adminService.getSuspiciousTransactions();
    }

    // ========================
    // REWARDS MANAGEMENT
    // ========================

    @PostMapping("/rules")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create Reward Rule", description = "Defines a new rule for point calculation")
    public ResponseEntity<RewardRuleDTO> createRewardRule(@RequestBody RewardRuleDTO ruleDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createRewardRule(ruleDTO));
    }

    @GetMapping("/rules")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get Active Rules")
    public List<RewardRuleDTO> getActiveRules() {
        return adminService.getActiveRules();
    }

    @PostMapping("/catalog")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create Catalog Item")
    public ResponseEntity<CatalogItemDTO> createCatalogItem(@RequestBody CatalogItemDTO catalogItemDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createCatalogItem(catalogItemDTO));
    }

    @PutMapping("/catalog/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update Catalog Item")
    public CatalogItemDTO updateCatalogItem(@PathVariable String id, @RequestBody CatalogItemDTO catalogItemDTO) {
        return adminService.updateCatalogItem(id, catalogItemDTO);
    }

    @GetMapping("/catalog")
    public List<CatalogItemDTO> getAllCatalog() {
        return adminService.getAllCatalog();
    }

    @PostMapping("/campaigns")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create Campaign")
    public ResponseEntity<CampaignDTO> createCampaign(@RequestBody CampaignDTO campaignDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createCampaign(campaignDTO));
    }

    @GetMapping("/campaigns")
    public List<CampaignDTO> getAllCampaigns() {
        return adminService.getAllCampaigns();
    }

    // ========================
    // REPORTS
    // ========================

    @GetMapping("/reports/summary")
    public Map<String, Object> getDashboardReport() {
        return adminService.getDashboardReport();
    }

    // ========================
    // AUDIT LOG
    // ========================

    @GetMapping("/audit-log")
    public List<AdminActionDTO> getAuditLog() {
        return adminService.getAuditLog();
    }
}