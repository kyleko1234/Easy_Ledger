package com.easyledger.api.model;

import java.time.OffsetDateTime;
import java.time.ZoneId;

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

import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;

import com.easyledger.api.dto.JournalEntryDTO;
import com.easyledger.api.dto.JournalEntryLogDTO;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

@SqlResultSetMapping( //maps native SQL query to EntryViewModel class
		name = "journalEntryLogDTOMapping",
		classes = {
				@ConstructorResult(
						targetClass = JournalEntryLogDTO.class,
						columns = {
								@ColumnResult(name = "id"),
								@ColumnResult(name = "datetimeOfEdit"),
								@ColumnResult(name = "personId"),
								@ColumnResult(name = "personFirstName"),
								@ColumnResult(name = "personLastName"),
								@ColumnResult(name = "journalEntryId"),
								@ColumnResult(name = "snapshot")

						}
				)
		}
)	
@NamedNativeQuery( //retrieves all undeleted entries for the given organization and maps them into EntryViewModels
		name = "JournalEntryLog.getAllJournalEntryLogsForJournalEntryId",
		query = "SELECT "
				+ "    journal_entry_log.id AS id, journal_entry_log.datetime_of_edit AS datetimeOfEdit, "
				+ "    journal_entry_log.person_id AS personId, person.first_name AS personFirstName, person.last_name AS personLastName, "
				+ "    journal_entry_log.journal_entry_id AS journalEntryId, journal_entry_log.snapshot AS shapshot "
				+ "FROM "
				+ "    journal_entry_log, person "
				+ "WHERE "
				+ "    journal_entry_log.person_id = person.id "
				+ "ORDER BY journal_entry_log.datetime_of_edit",
		resultSetMapping = "journalEntryLogDTOMapping"
)



@TypeDefs({
	@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
})
@Entity
@Table(name = "journal_entry_log")
public class JournalEntryLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "datetime_of_edit")
	private OffsetDateTime datetimeOfEdit = OffsetDateTime.now(ZoneId.of("UTC"));
	
	@Type(type = "jsonb")
	@Column(name = "snapshot", columnDefinition = "jsonb")
	private JournalEntryDTO snapshot;
	
	@ManyToOne
	@JoinColumn(name = "person_id")
	private Person person;

	@ManyToOne
	@JoinColumn(name = "journal_entry_id")
	private JournalEntry journalEntry;

	public JournalEntryLog(JournalEntry journalEntry) {
		this.journalEntry = journalEntry;
		this.person = journalEntry.getPerson();
		this.snapshot = new JournalEntryDTO(journalEntry);
	}
	
	public JournalEntryLog(JournalEntry journalEntry, JournalEntryDTO dto, Person person) {
		this.journalEntry = journalEntry;
		this.person = person;
		this.snapshot = dto;
	}
	
	public JournalEntryLog() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public OffsetDateTime getDatetimeOfEdit() {
		return datetimeOfEdit;
	}

	public void setDatetimeOfEdit(OffsetDateTime datetimeOfEdit) {
		this.datetimeOfEdit = datetimeOfEdit;
	}

	public JournalEntryDTO getSnapshot() {
		return snapshot;
	}

	public void setSnapshot(JournalEntryDTO snapshot) {
		this.snapshot = snapshot;
	}

	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}

	public JournalEntry getJournalEntry() {
		return journalEntry;
	}

	public void setJournalEntry(JournalEntry journalEntry) {
		this.journalEntry = journalEntry;
	}

	@Override
	public String toString() {
		return "JournalEntryLog [id=" + id + ", datetimeOfEdit=" + datetimeOfEdit + ", snapshot=" + snapshot
				+ ", person=" + person + ", journalEntry=" + journalEntry + "]";
	}

}
