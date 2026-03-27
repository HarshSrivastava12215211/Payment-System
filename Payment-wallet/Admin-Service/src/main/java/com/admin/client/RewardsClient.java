package com.admin.client;

import java.util.List;
import java.util.Map;
import com.admin.dto.*;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "Rewards-Service")
public interface RewardsClient {

    @PostMapping("/api/rewards/rules")
    RewardRuleDTO createRule(@RequestBody RewardRuleDTO ruleDTO);

    @GetMapping("/api/rewards/rules")
    List<RewardRuleDTO> getActiveRules();

    @PostMapping("/api/rewards/catalog")
    CatalogItemDTO createCatalogItem(@RequestBody CatalogItemDTO catalogItemDTO);

    @PutMapping("/api/rewards/catalog/{id}")
    CatalogItemDTO updateCatalogItem(@PathVariable("id") String id, @RequestBody CatalogItemDTO catalogItemDTO);

    @GetMapping("/api/rewards/catalog/all")
    List<CatalogItemDTO> getAllCatalog();

    @PostMapping("/api/rewards/campaigns")
    CampaignDTO createCampaign(@RequestBody CampaignDTO campaignDTO);

    @GetMapping("/api/rewards/campaigns/all")
    List<CampaignDTO> getAllCampaigns();

    @GetMapping("/api/rewards/reports/summary")
    Map<String, Object> getReportsSummary();
}
