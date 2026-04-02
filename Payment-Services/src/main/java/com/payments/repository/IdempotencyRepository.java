package com.payments.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.payments.entity.Idempotency;

@Repository
public interface IdempotencyRepository extends JpaRepository<Idempotency, String> {
	
	Optional<Idempotency> findByIdempotencyKey(String idempotencyKey);

}
