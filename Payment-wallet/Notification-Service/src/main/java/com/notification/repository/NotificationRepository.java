package com.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByStatus(String status);
}
