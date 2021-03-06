package com.easyledger.api.viewmodel;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.util.Date;

public class JournalEntryViewModel {
	
	private Long journalEntryId;
	private Date journalEntryDate;
	private String description;
	private BigDecimal debitAmount;
	private BigDecimal creditAmount;
	
	public JournalEntryViewModel(BigInteger journalEntryId, Date journalEntryDate, String description, BigDecimal debitAmount,
			BigDecimal creditAmount) {
		this.journalEntryId = journalEntryId.longValueExact();
		this.journalEntryDate = journalEntryDate;
		this.description = description;
		this.debitAmount = debitAmount;
		this.creditAmount = creditAmount;
	}
	
	public JournalEntryViewModel() {
	}


	public Long getJournalEntryId() {
		return journalEntryId;
	}

	public void setJournalEntryId(Long journalEntryId) {
		this.journalEntryId = journalEntryId;
	}

	public Date getJournalEntryDate() {
		return journalEntryDate;
	}

	public void setJournalEntryDate(Date journalEntryDate) {
		this.journalEntryDate = journalEntryDate;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getDebitAmount() {
		return debitAmount;
	}

	public void setDebitAmount(BigDecimal debitAmount) {
		this.debitAmount = debitAmount;
	}

	public BigDecimal getCreditAmount() {
		return creditAmount;
	}

	public void setCreditAmount(BigDecimal creditAmount) {
		this.creditAmount = creditAmount;
	}

	@Override
	public String toString() {
		return "JournalEntryViewModel [journalEntryId=" + journalEntryId + ", journalEntryDate=" + journalEntryDate
				+ ", description=" + description + ", debitAmount=" + debitAmount + ", creditAmount=" + creditAmount
				+ "]";
	}
	
	
}
