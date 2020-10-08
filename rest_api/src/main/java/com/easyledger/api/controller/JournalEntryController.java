package com.easyledger.api.controller;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

import javax.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.easyledger.api.dto.JournalEntryDTO;
import com.easyledger.api.exception.ConflictException;
import com.easyledger.api.exception.ResourceNotFoundException;
import com.easyledger.api.model.JournalEntry;
import com.easyledger.api.model.LineItem;
import com.easyledger.api.repository.JournalEntryRepository;
import com.easyledger.api.repository.LineItemRepository;
import com.easyledger.api.repository.OrganizationRepository;
import com.easyledger.api.service.JournalEntryService;
import com.easyledger.api.service.LineItemService;
import com.easyledger.api.viewmodel.JournalEntryViewModel;

@RestController
@CrossOrigin("*")
@RequestMapping("/v0.1")
public class JournalEntryController {
	private JournalEntryRepository journalEntryRepo;
	private JournalEntryService journalEntryService;
	private LineItemService lineItemService;
	private LineItemRepository lineItemRepo;
	private OrganizationRepository organizationRepo;

	public JournalEntryController(JournalEntryRepository journalEntryRepo, JournalEntryService journalEntryService, 
			LineItemService lineItemService, LineItemRepository lineItemRepo, OrganizationRepository organizationRepo) {
		super();
		this.journalEntryRepo = journalEntryRepo;
		this.journalEntryService = journalEntryService;
		this.lineItemService = lineItemService;
		this.lineItemRepo = lineItemRepo;
		this.organizationRepo = organizationRepo;
	}


	@GetMapping("/journalEntry")
    public ArrayList<JournalEntryDTO> getAllJournalEntries() {
        List<JournalEntry> journalEntries = journalEntryRepo.findAll();
        ArrayList<JournalEntryDTO> journalEntryDtos = new ArrayList<JournalEntryDTO>();
        for (JournalEntry journalEntry : journalEntries) {
        	journalEntryDtos.add(new JournalEntryDTO(journalEntry));
        }
        return journalEntryDtos;
    }
	
	@GetMapping(path = "organization/{id}/journalEntryViewModel")
	public Page<JournalEntryViewModel> getAllJournalEntryViewModelsForOrganization(
			@PathVariable(value = "id") Long organizationId, Pageable pageable) throws ResourceNotFoundException {
		organizationRepo.findById(organizationId)
			.orElseThrow(() -> new ResourceNotFoundException("Organization not found for this id :: " + organizationId));
		return journalEntryRepo.getAllJournalEntryViewModelsForOrganization(organizationId, pageable);
	}

	
    @GetMapping("/journalEntry/{id}")
    public ResponseEntity<JournalEntryDTO> getJournalEntryById(@PathVariable(value = "id") Long journalEntryId)
        throws ResourceNotFoundException {
    	JournalEntry journalEntry = journalEntryRepo.findById(journalEntryId)
    		.orElseThrow(() -> new ResourceNotFoundException("Journal Entry not found for this id :: " + journalEntryId)); 
    	JournalEntryDTO journalEntryDTO = new JournalEntryDTO(journalEntry);
        return ResponseEntity.ok().body(journalEntryDTO);
    }
    
    @DeleteMapping("/journalEntry/{id}")
    public Map<String, Boolean> deleteJournalEntry(@PathVariable(value = "id") Long journalEntryId)
         throws ResourceNotFoundException {
        JournalEntry journalEntry = journalEntryRepo.findById(journalEntryId)
       .orElseThrow(() -> new ResourceNotFoundException("Journal Entry not found for this id :: " + journalEntryId));

        journalEntry.setDeleted(true);
        journalEntryRepo.save(journalEntry);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return response;
    }
    
    
    /** PUT overwrites an old Entry with new Entry data, deletes the old LineItems, and repopulates the Entry with new LineItems.
      * LineItems are deleted and replaced with information from the request body, without regard to whether or not any changes were actually made.
      * Full Entry information must be sent with each PUT request, including all LineItems. A PUT Entry with a request body that contains no LineItems
      * will result in an Entry that has no associated LineItems in the DB.
      * ID of Entry will be preserved, but all lineItemIds will be newly generated, regardless what the lineItemId field in the RequestBody says.**/ 		
    @Transactional(rollbackFor=Exception.class)
    @PutMapping("/journalEntry/{id}")
    public ResponseEntity<JournalEntryDTO> updateJournalEntryById(@PathVariable(value = "id") Long id, @RequestBody JournalEntryDTO dto) 
    	throws ConflictException, ResourceNotFoundException {
    	// Assert URI id is the same as id in the request body.
    	if (dto.getJournalEntryId() == null || !dto.getJournalEntryId().equals(id)) {
    		throw new ConflictException("Entry ID in request body does not match URI.");
    	}
    	
    	//Assert that an entry for this id exists
    	JournalEntry oldJournalEntry = journalEntryRepo.findById(id)
        	.orElseThrow(() -> new ResourceNotFoundException("Journal Entry not found for this id :: " + id)); 
    	
    	//Delete old LineItems.
    	Iterator<LineItem> oldLineItemIterator = oldJournalEntry.getLineItems().iterator();
    	while (oldLineItemIterator.hasNext()) {
    		lineItemRepo.deleteById(oldLineItemIterator.next().getId());
    	}
    	
    	//Replace entry with data from the request body. Will create new LineItems to replace old ones.
    	//Must create a new Entry entity object even if updating an existing entry, otherwise
    	//Spring will attempt to map the deleted old LineItems to the updated Entry.
    	JournalEntry updatedJournalEntry = journalEntryService.createJournalEntryFromDTO(dto);
    	
    	//Assert credits and debits are equal in updatedEntry
    	if (!journalEntryService.assertAccountingBalance(updatedJournalEntry)) {
    		throw new ConflictException("Total debits in this entry are not equal to total credits.");
    	}
    	
    	//Save Entry and its LineItems. Must save in this order, otherwise will violate not-nullable property.
    	Iterator<LineItem> newLineItemIterator = updatedJournalEntry.getLineItems().iterator();
    	journalEntryRepo.save(updatedJournalEntry);
    	while (newLineItemIterator.hasNext()) {
    		lineItemRepo.save(newLineItemIterator.next());
    	}
    		    
    	//Return updated entry.
    	JournalEntryDTO newEntryDTO = new JournalEntryDTO(updatedJournalEntry);
    	return ResponseEntity.ok().body(newEntryDTO);

    }

    @Transactional(rollbackFor=Exception.class)
    @PostMapping("/journalEntry")
    @ResponseStatus(HttpStatus.CREATED)
    public JournalEntryDTO createJournalEntryById(@RequestBody JournalEntryDTO dto) 
    	throws ConflictException, ResourceNotFoundException {
    
    	if (dto.getJournalEntryId() != null) {
    		throw new ConflictException("Please do not attempt to manually create an EntryId.");
    	}
    	
    	//Create Entry entity object from DTO
    	JournalEntry updatedJournalEntry = journalEntryService.createJournalEntryFromDTO(dto);
    	
    	//Assert credits and debits are equal in updatedEntry
    	if (!journalEntryService.assertAccountingBalance(updatedJournalEntry)) {
    		throw new ConflictException("Total debits in this entry are not equal to total credits.");
    	}
    	
    	//Save Entry and its LineItems. Must save in this order, otherwise will violate not-nullable property.
    	Iterator<LineItem> newLineItemIterator = updatedJournalEntry.getLineItems().iterator();
    	journalEntryRepo.save(updatedJournalEntry);
    	while (newLineItemIterator.hasNext()) {
    		lineItemRepo.save(newLineItemIterator.next());
    	}
    		    
    	//Return updated entry.
    	JournalEntryDTO newEntryDTO = new JournalEntryDTO(updatedJournalEntry);
    	return newEntryDTO;

    }


}
