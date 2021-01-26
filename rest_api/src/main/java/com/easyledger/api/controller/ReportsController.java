package com.easyledger.api.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyledger.api.exception.UnauthorizedException;
import com.easyledger.api.security.AuthorizationService;
import com.easyledger.api.service.BalanceSheetService;
import com.easyledger.api.viewmodel.BalanceSheetViewModel;

@RestController
@CrossOrigin("*")
@RequestMapping("/v0.2")
public class ReportsController {
	private BalanceSheetService balanceSheetService;
	private AuthorizationService authorizationService;
	
	
    public ReportsController(BalanceSheetService balanceSheetService, AuthorizationService authorizationService) {
		super();
		this.balanceSheetService = balanceSheetService;
		this.authorizationService = authorizationService;
	}

	@GetMapping("/test1")
    public LocalDate testMePlease() {
		LocalDate endDate = LocalDate.parse("2021-01-23");
		LocalDate prevYearEnd = LocalDate.parse((endDate.getYear() - 1) + "-12-31");
		LocalDate currYearStart = LocalDate.parse(endDate.getYear() + "-01-01");
		return currYearStart;
    }
	
	@GetMapping("/organization/{id}/reports/balanceSheet/{endDate}") 
	public BalanceSheetViewModel getBalanceSheetViewModelForOrganizationUpToDate(@PathVariable(value = "id") Long organizationId, 
    		@PathVariable(value = "endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate, Authentication authentication) 
    		throws UnauthorizedException {
		authorizationService.authorizeByOrganizationId(authentication, organizationId);
		return balanceSheetService.getBalanceSheetViewModelForOrganizationUpToDate(organizationId, endDate);
	}
}