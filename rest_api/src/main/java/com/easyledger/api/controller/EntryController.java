package com.easyledger.api.controller;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashMap;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;
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

import com.easyledger.api.dto.EntryDTO;
import com.easyledger.api.exception.ConflictException;
import com.easyledger.api.exception.ResourceNotFoundException;
import com.easyledger.api.model.Entry;
import com.easyledger.api.model.LineItem;
import com.easyledger.api.repository.EntryRepository;
import com.easyledger.api.repository.LineItemRepository;
import com.easyledger.api.service.EntryService;
import com.easyledger.api.service.LineItemService;
import com.easyledger.api.viewmodel.EntryViewModel;

@RestController
@CrossOrigin("*")
@RequestMapping("/v0.1")
public class EntryController {
	private EntryRepository entryRepo;
	private EntryService entryService;
	private LineItemService lineItemService;
	private LineItemRepository lineItemRepo;

	public EntryController(EntryRepository entryRepo, EntryService entryService, 
			LineItemService lineItemService, LineItemRepository lineItemRepo) {
		super();
		this.entryRepo = entryRepo;
		this.entryService = entryService;
		this.lineItemService = lineItemService;
		this.lineItemRepo = lineItemRepo;
	}


	@GetMapping("/entry")
    public ArrayList<EntryDTO> getAllEntries() {
        List<Entry> entries = entryRepo.findAll();
        ArrayList<EntryDTO> entryDtos = new ArrayList<EntryDTO>();
        for (Entry entry : entries) {
        	entryDtos.add(new EntryDTO(entry));
        }
        return entryDtos;
    }
	
	@GetMapping("/entryViewModel")
	public List<EntryViewModel> getAllEntryViewModels(@RequestBody Map<String, Integer> params) 
		throws ConflictException {
		Integer pageNumber = null;
		Integer entriesPerPage = null;
		Integer offset = null;
		Integer limit = null;
		
		//this syntax is incredibly confusing to read; within this loop 'entry' refers to each key-value pair in the json request body
        for (Map.Entry<String, Integer> entry : params.entrySet()) {
        	String k = entry.getKey();
        	Integer v = entry.getValue();
        	switch (k) {
        		case "pageNumber":
        			pageNumber = v;
        			break;
        			
        		case "entriesPerPage":
        			entriesPerPage = v;
        			break;
        	}
        }
        
        if (pageNumber == null || entriesPerPage == null) {
        	throw new ConflictException("Missing parameters. pageNumber and entriesPerPage both required.");
        }
        if (pageNumber <= 0) {
        	throw new ConflictException("Page number must be a positive number");
        }
        if (entriesPerPage <= 0) {
        	throw new ConflictException("Must request at least one entry per page");
        }
        
        offset = (pageNumber - 1) * entriesPerPage;
        limit = entriesPerPage;
        
		return entryRepo.getAllEntryViewModels(offset, limit);
	}

	
    @GetMapping("/entry/{id}")
    public ResponseEntity<EntryDTO> getEntryById(@PathVariable(value = "id") Long entryId)
        throws ResourceNotFoundException {
    	Entry entry = entryRepo.findById(entryId)
    		.orElseThrow(() -> new ResourceNotFoundException("Entry not found for this id :: " + entryId)); 
    	EntryDTO entryDTO = new EntryDTO(entry);
        return ResponseEntity.ok().body(entryDTO);
    }
    
    @DeleteMapping("/entry/{id}")
    public Map<String, Boolean> deleteEntry(@PathVariable(value = "id") Long entryId)
         throws ResourceNotFoundException {
        Entry entry = entryRepo.findById(entryId)
       .orElseThrow(() -> new ResourceNotFoundException("Entry not found for this id :: " + entryId));

        entryRepo.delete(entry);
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
    @PutMapping("/entry/{id}")
    public ResponseEntity<EntryDTO> updateEntryById(@PathVariable(value = "id") Long id, @RequestBody EntryDTO dto) 
    	throws ConflictException, ResourceNotFoundException {
    	// Assert URI id is the same as id in the request body.
    	if (dto.getEntryId() == null || !dto.getEntryId().equals(id)) {
    		throw new ConflictException("Entry ID in request body does not match URI.");
    	}
    	
    	//Assert that an entry for this id exists
    	Entry oldEntry = entryRepo.findById(id)
        	.orElseThrow(() -> new ResourceNotFoundException("Entry not found for this id :: " + id)); 
    	
    	//Delete old LineItems.
    	Iterator<LineItem> oldLineItemIterator = oldEntry.getLineItems().iterator();
    	while (oldLineItemIterator.hasNext()) {
    		lineItemRepo.deleteById(oldLineItemIterator.next().getId());
    	}
    	
    	//Replace entry with data from the request body. Will create new LineItems to replace old ones.
    	//Must create a new Entry entity object even if updating an existing entry, otherwise
    	//Spring will attempt to map the deleted old LineItems to the updated Entry.
    	Entry updatedEntry = entryService.createEntryFromDTO(dto);
    	
    	//Assert credits and debits are equal in updatedEntry
    	if (!entryService.assertAccountingBalance(updatedEntry)) {
    		throw new ConflictException("Total debits in this entry are not equal to total credits.");
    	}
    	
    	//Save Entry and its LineItems. Must save in this order, otherwise will violate not-nullable property.
    	Iterator<LineItem> newLineItemIterator = updatedEntry.getLineItems().iterator();
    	entryRepo.save(updatedEntry);
    	while (newLineItemIterator.hasNext()) {
    		lineItemRepo.save(newLineItemIterator.next());
    	}
    		    
    	//Return updated entry.
    	EntryDTO newEntryDTO = new EntryDTO(updatedEntry);
    	return ResponseEntity.ok().body(newEntryDTO);

    }

    @Transactional(rollbackFor=Exception.class)
    @PostMapping("/entry")
    @ResponseStatus(HttpStatus.CREATED)
    public EntryDTO createEntryById(@RequestBody EntryDTO dto) 
    	throws ConflictException, ResourceNotFoundException {
    
    	if (dto.getEntryId() != null) {
    		throw new ConflictException("Please do not attempt to manually create an EntryId.");
    	}
    	
    	//Create Entry entity object from DTO
    	Entry updatedEntry = entryService.createEntryFromDTO(dto);
    	
    	//Assert credits and debits are equal in updatedEntry
    	if (!entryService.assertAccountingBalance(updatedEntry)) {
    		throw new ConflictException("Total debits in this entry are not equal to total credits.");
    	}
    	
    	//Save Entry and its LineItems. Must save in this order, otherwise will violate not-nullable property.
    	Iterator<LineItem> newLineItemIterator = updatedEntry.getLineItems().iterator();
    	entryRepo.save(updatedEntry);
    	while (newLineItemIterator.hasNext()) {
    		lineItemRepo.save(newLineItemIterator.next());
    	}
    		    
    	//Return updated entry.
    	EntryDTO newEntryDTO = new EntryDTO(updatedEntry);
    	return newEntryDTO;

    }


}

