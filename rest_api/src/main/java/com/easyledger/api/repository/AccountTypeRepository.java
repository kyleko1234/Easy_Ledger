package com.easyledger.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyledger.api.model.AccountType;

@Repository
public interface AccountTypeRepository extends JpaRepository<AccountType, Long> {

	
}