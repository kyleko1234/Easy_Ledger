package com.easyledger.api.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyledger.api.dto.DateRangeDTO;
import com.easyledger.api.dto.MonthlyNetAssetsDTO;
import com.easyledger.api.exception.ResourceNotFoundException;
import com.easyledger.api.model.Organization;
import com.easyledger.api.repository.OrganizationRepository;

@Service
public class OrganizationService {
	
	@Autowired
	private OrganizationRepository organizationRepo;

	public OrganizationService(OrganizationRepository organizationRepo) {
		super();
		this.organizationRepo = organizationRepo;
	}

	public List<MonthlyNetAssetsDTO> getMonthlyNetAssetsDTOsForOrganization(Long organizationId, int numberOfMonths) {
		List<MonthlyNetAssetsDTO> returnedList = new ArrayList<MonthlyNetAssetsDTO>(numberOfMonths);
		List<Integer> yearMonthsToQuery = new ArrayList<Integer>(numberOfMonths);
		
    	//get current year and month as ints
    	LocalDate now = LocalDate.now();
    	int year = now.getYear();
    	int month = now.getMonthValue(); 
    	
    	for (int i = 0; i < numberOfMonths; i++) {
    		yearMonthsToQuery.add(0);
    	}
    	
		for (int i = numberOfMonths - 1; i >= 0; i--) {
			yearMonthsToQuery.add(i, ((year * 100) + month));
			yearMonthsToQuery.remove(i + 1);
			month -= 1;
			if (month == 0) {
				year -= 1;
				month = 12;
			}
		}
		
		for (int yearMonth : yearMonthsToQuery) {
			returnedList.add(organizationRepo.getMonthlyNetAssetsDTO(organizationId, yearMonth));
		}
		
		return returnedList;
	}
	
	public List<DateRangeDTO> getDateRangePresetsForOrganizationUpToDate(Long organizationId, LocalDate endDate) throws ResourceNotFoundException {
		List<DateRangeDTO> returnedList = new ArrayList<DateRangeDTO>();
		LocalDate dateOfFirstJournalEntry = organizationRepo.getDateOfFirstJournalEntryForOrganization(organizationId);
		Organization organization = organizationRepo.findById(organizationId)
				.orElseThrow(() -> new ResourceNotFoundException("Organization not found for this id :: " + organizationId));
		LocalDate fiscalYearBeginDate = organization.getFiscalYearBegin();
		if (dateOfFirstJournalEntry != null) {
			int firstFiscalYear;
			int lastFiscalYear;
			//if date of first journal entry is before fiscal year begin date, the first fiscal year is the year before the calendar year of the date of the first journal entry
			if (dateOfFirstJournalEntry.withYear(fiscalYearBeginDate.getYear()).compareTo(fiscalYearBeginDate) < 0) { 
				firstFiscalYear = dateOfFirstJournalEntry.getYear() - 1;
			} else {
				firstFiscalYear = dateOfFirstJournalEntry.getYear();
			}
			//if endDate  is before fiscal year begin date, the last fiscal year is the year before the calendar year of endDate
			if (endDate.withYear(fiscalYearBeginDate.getYear()).compareTo(fiscalYearBeginDate) < 0) {
				lastFiscalYear = endDate.getYear() - 1;
			} else {
				lastFiscalYear = endDate.getYear();
			}
			
			for (int yearNumber = lastFiscalYear; yearNumber >= firstFiscalYear; yearNumber--) {
				String name = "Fiscal Year " + yearNumber;
				LocalDate startDateOfDateRange = fiscalYearBeginDate.withYear(yearNumber);
				LocalDate endDateOfDateRange;
				endDateOfDateRange = startDateOfDateRange.plusYears(1).minusDays(1);
				returnedList.add(new DateRangeDTO(name, startDateOfDateRange, endDateOfDateRange));
			}
		}
		return returnedList;
	}

}
