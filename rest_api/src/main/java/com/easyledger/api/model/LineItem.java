package com.easyledger.api.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.ColumnResult;
import javax.persistence.ConstructorResult;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedNativeQuery;
import javax.persistence.SqlResultSetMapping;
import javax.persistence.Table;

import com.easyledger.api.dto.LineItemDTO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@SqlResultSetMapping( //maps native SQL query to LineItemDTO class
		name = "lineItemDTOMapping",
		classes = {
				@ConstructorResult(
						targetClass = LineItemDTO.class,
						columns = {
								@ColumnResult(name = "accountId"),
								@ColumnResult(name = "accountName"),
								@ColumnResult(name = "accountSubtypeId"),
								@ColumnResult(name = "accountSubtypeName"),
								@ColumnResult(name = "accountTypeId"),
								@ColumnResult(name = "accountTypeName"),
								@ColumnResult(name = "amount"),
								@ColumnResult(name = "categoryId"),
								@ColumnResult(name = "categoryName"),
								@ColumnResult(name = "description"),
								@ColumnResult(name = "journalEntryId"),
								@ColumnResult(name = "journalEntryDate"),
								@ColumnResult(name = "isCredit"),
								@ColumnResult(name = "lineItemId")
						}
				)
		}
)	
@NamedNativeQuery( //retrieves all undeleted LineItems in undeleted entries for an account when given an accountId
		name = "LineItem.getAllLineItemsForAccount",
		query = "SELECT " + 
				"    line_item.id AS lineItemId, " + 
				"    line_item.journal_entry_id AS journalEntryId, " + 
				"    journal_entry.journal_entry_date AS journalEntryDate, " + 
				"    line_item.account_id AS accountId, " + 
				"    line_item.is_credit AS isCredit, " + 
				"    line_item.amount AS amount, " + 
				"    line_item.description AS description, " + 
				"    line_item.category_id AS categoryId, " + 
				"    category.name AS categoryName, " + 
				"    account.name AS accountName, " + 
				"    account.account_type_id AS accountTypeId, " + 
				"    account_type.name AS accountTypeName, " + 
				"    account_subtype.id AS accountSubtypeId, " + 
				"    account_subtype.name AS accountSubtypeName " + 
				"FROM " + 
				"    line_item LEFT OUTER JOIN category on line_item.category_id = category.id, " + 
				"    account LEFT OUTER JOIN account_subtype on account.account_subtype_id = account_subtype.id " + 
				"    LEFT OUTER JOIN account_type on account.account_type_id = account_type.id, " + 
				"	 journal_entry " + 
				"WHERE line_item.account_id = account.id AND account.id = ? AND line_item.journal_entry_id = journal_entry.id AND journal_entry.deleted = false " + 
				"ORDER BY journal_entry.journal_entry_date, line_item.id DESC",
		resultSetMapping = "lineItemDTOMapping"
)
@NamedNativeQuery( //retrieves all LineItems in undeleted entries for a category when given a categoryId
		name = "LineItem.getAllLineItemsForCategory",
		query = "SELECT " + 
				"    line_item.id AS lineItemId, " + 
				"    line_item.journal_entry_id AS journalEntryId, " + 
				"    journal_entry.journal_entry_date AS journalEntryDate, " + 
				"    line_item.account_id AS accountId, " + 
				"    line_item.is_credit AS isCredit, " + 
				"    line_item.amount AS amount, " + 
				"    line_item.description AS description, " + 
				"    line_item.category_id AS categoryId, " + 
				"    category.name AS categoryName, " + 
				"    account.name AS accountName, " + 
				"    account.account_type_id AS accountTypeId, " + 
				"    account_type.name AS accountTypeName, " + 
				"    account_subtype.id AS accountSubtypeId, " + 
				"    account_subtype.name AS accountSubtypeName " + 
				"FROM " + 
				"    line_item LEFT OUTER JOIN category on line_item.category_id = category.id, " + 
				"    account LEFT OUTER JOIN account_subtype on account.account_subtype_id = account_subtype.id " + 
				"    LEFT OUTER JOIN account_type on account.account_type_id = account_type.id, " + 
				"    journal_entry " + 
				"WHERE line_item.account_id = account.id AND line_item.category_id = ? AND line_item.journal_entry_id = journal_entry.id AND journal_entry.deleted = false " + 
				"ORDER BY journal_entry.journal_entry_date, line_item.id DESC",
		resultSetMapping = "lineItemDTOMapping"
)
@SqlResultSetMapping(//sqlresultsetmapping for counting query
		name = "lineItemDTOMapping.count",
		columns = @ColumnResult(name = "count"))

@NamedNativeQuery( //query to count number of LineItems in order to use Pageable on LineItem.getAllLineItemsForAccount
		name = "LineItem.getAllLineItemsForAccount.count",
		query = "SELECT count(*) AS count from line_item, journal_entry WHERE line_item.account_id = ? AND line_item.journal_entry_id = journal_entry.id AND journal_entry.deleted = false",
		resultSetMapping = "lineItemDTOMapping.count"
)
@NamedNativeQuery( //query to count number of LineItems in order to use Pageable on LineItem.getAllLineItemsForCategory
		name = "LineItem.getAllLineItemsForCategory.count",
		query = "SELECT count(*) AS count from line_item, journal_entry WHERE line_item.category_id = ? AND line_item.journal_entry_id = journal_entry.id AND journal_entry.deleted = false ",
		resultSetMapping = "lineItemDTOMapping.count"
)




@Entity
@Table(name = "line_item")
public class LineItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "is_credit", nullable = false)
	private boolean isCredit;
	
	@Column(name = "amount", nullable = false)
	private BigDecimal amount;
	
	@Column(name = "description", nullable = true)
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "account_id", nullable = false)
	private Account account;
	
	@ManyToOne
	@JoinColumn(name = "category_id", nullable = true)
	private Category category;
	
	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "journal_entry_id", nullable = false)
	private JournalEntry journalEntry;
	
	public LineItem(boolean isCredit, BigDecimal amount, String description) {
		this.isCredit = isCredit;
		this.amount = amount;
		this.description = description;
	}
	
	public LineItem() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public boolean isIsCredit() {
		return isCredit;
	}
	
	public void setIsCredit(boolean isCredit) {
		this.isCredit = isCredit;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Account getAccount() {
		return account;
	}

	public void setAccount(Account account) {
		this.account = account;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
		category.getLineItems().add(this);
	}

	public JournalEntry getJournalEntry() {
		return journalEntry;
	}

	public void setJournalEntry(JournalEntry journalEntry) {
		this.journalEntry = journalEntry;
		journalEntry.getLineItems().add(this);
	}

	@Override
	public String toString() {
		return "LineItem [id=" + id + ", isCredit=" + isCredit + ", amount=" + amount + ", description=" + description
				+ ", account=" + account + ", category=" + category + ", journalEntry=" + journalEntry + "]";
	}




	
	
}
