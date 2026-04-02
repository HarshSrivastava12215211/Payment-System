package com.transactions.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.transactions.Repository.DisputeRepository;
import com.transactions.Repository.TransactionRepository;
import com.transactions.dto.CreateDisputeRequest;
import com.transactions.dto.DisputeDTO;
import com.transactions.dto.UpdateDisputeRequest;
import com.transactions.entity.Dispute;
import com.transactions.entity.DisputeStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public DisputeDTO createDispute(CreateDisputeRequest request) {
        // Verify transaction exists
        transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Dispute dispute = Dispute.builder()
                .transactionId(request.getTransactionId())
                .userId(request.getUserId())
                .reason(request.getReason())
                .status(DisputeStatus.OPEN)
                .build();

        dispute = disputeRepository.save(dispute);
        return toDTO(dispute);
    }

    public List<DisputeDTO> getUserDisputes(Long userId) {
        return disputeRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DisputeDTO> getAllDisputes() {
        return disputeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DisputeDTO> getOpenDisputes() {
        return disputeRepository.findByStatus(DisputeStatus.OPEN).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisputeDTO updateDispute(String disputeId, UpdateDisputeRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Dispute not found"));

        if (request.getStatus() != null) {
            dispute.setStatus(DisputeStatus.valueOf(request.getStatus()));
        }
        if (request.getAdminNote() != null) {
            dispute.setAdminNote(request.getAdminNote());
        }
        if (request.getResolution() != null) {
            dispute.setResolution(request.getResolution());
        }

        dispute = disputeRepository.save(dispute);
        return toDTO(dispute);
    }

    private DisputeDTO toDTO(Dispute d) {
        return DisputeDTO.builder()
                .id(d.getId())
                .transactionId(d.getTransactionId())
                .userId(d.getUserId())
                .reason(d.getReason())
                .status(d.getStatus().name())
                .adminNote(d.getAdminNote())
                .resolution(d.getResolution())
                .createdAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null)
                .updatedAt(d.getUpdatedAt() != null ? d.getUpdatedAt().toString() : null)
                .build();
    }
}
