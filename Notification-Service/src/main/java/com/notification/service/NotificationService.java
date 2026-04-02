package com.notification.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.notification.dto.NotificationDTO;
import com.notification.dto.SendNotificationRequest;
import com.notification.entity.Notification;
import com.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationDTO sendNotification(SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .channel(request.getChannel())
                .subject(request.getSubject())
                .message(request.getMessage())
                .recipientEmail(request.getRecipientEmail())
                .recipientPhone(request.getRecipientPhone())
                .status("PENDING")
                .build();

        String status;

        try {
            switch (request.getType().toUpperCase()) {
                case "EMAIL":
                    sendEmail(request.getRecipientEmail(), request.getSubject(), request.getMessage());
                    status = "SENT";
                    break;
                case "SMS":
                    // SMS integration placeholder - log for now
                    System.out.println("[SMS] To: " + request.getRecipientPhone()
                            + " | Message: " + request.getMessage());
                    status = "SENT";
                    break;
                case "PUSH":
                    // Push notification placeholder - log for now
                    System.out.println("[PUSH] To userId: " + request.getUserId()
                            + " | Message: " + request.getMessage());
                    status = "SENT";
                    break;
                default:
                    status = "FAILED";
                    break;
            }
        } catch (Exception e) {
            status = "FAILED";
            System.err.println("Notification failed: " + e.getMessage());
        }

        notification.setStatus(status);
        notification = notificationRepository.save(notification);

        return toDTO(notification);
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject != null ? subject : "Notification from Payment Wallet");
        message.setText(body);
        mailSender.send(message);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .channel(n.getChannel())
                .subject(n.getSubject())
                .message(n.getMessage())
                .status(n.getStatus())
                .recipientEmail(n.getRecipientEmail())
                .recipientPhone(n.getRecipientPhone())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .build();
    }
}
