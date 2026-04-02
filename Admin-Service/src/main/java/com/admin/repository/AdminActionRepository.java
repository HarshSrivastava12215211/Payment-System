package com.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.admin.entity.AdminAction;

public interface AdminActionRepository extends JpaRepository<AdminAction, String> {
    List<AdminAction> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    List<AdminAction> findAllByOrderByCreatedAtDesc();
}
