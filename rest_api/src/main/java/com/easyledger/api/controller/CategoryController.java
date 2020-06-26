package com.easyledger.api.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.easyledger.api.dto.CategoryDTO;
import com.easyledger.api.exception.ConflictException;
import com.easyledger.api.exception.ResourceNotFoundException;
import com.easyledger.api.model.Category;
import com.easyledger.api.repository.AccountTypeRepository;
import com.easyledger.api.repository.CategoryRepository;
import com.easyledger.api.service.CategoryService;

@RestController
@RequestMapping("/v0.1")
public class CategoryController {

	private CategoryRepository categoryRepo;
	private CategoryService categoryService;
	private AccountTypeRepository accountTypeRepo;

    public CategoryController(CategoryRepository categoryRepo, CategoryService categoryService, AccountTypeRepository accountTypeRepo) {
		super();
		this.categoryRepo = categoryRepo;
		this.accountTypeRepo = accountTypeRepo;
		this.categoryService = categoryService;
	}

	@GetMapping("/category")
    public ArrayList<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepo.findAll();
        ArrayList<CategoryDTO> categoryDtos = new ArrayList<CategoryDTO>();
        for (Category category : categories) {
        	categoryDtos.add(new CategoryDTO(category));
        }
        return categoryDtos;
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable(value = "id") Long categoryId)
        throws ResourceNotFoundException {
        Category category = categoryRepo.findById(categoryId)
          .orElseThrow(() -> new ResourceNotFoundException("Category not found for this id :: " + categoryId));
        CategoryDTO dto = new CategoryDTO(category);
        return ResponseEntity.ok().body(dto);
    }
    
    @PostMapping("/category")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDTO createCategory(@Valid @RequestBody CategoryDTO dto) 
    	throws ResourceNotFoundException {
    	Category category = categoryService.createCategoryFromDTO(dto);
    	assertExistingAccountType(category);
    	final Category updatedCategory = categoryRepo.save(category);
    	return new CategoryDTO(updatedCategory);
    	}

    @PutMapping("/category/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable(value = "id") Long categoryId,
        @Valid @RequestBody CategoryDTO dto) throws ResourceNotFoundException, ConflictException {
    	Category categoryDetails = categoryService.createCategoryFromDTO(dto);
        if (!categoryId.equals(categoryDetails.getId())) {
        	throw new ConflictException("Category ID in request body does not match URI.");
        }
    	
    	categoryRepo.findById(categoryId)
        	.orElseThrow(() -> new ResourceNotFoundException("Category not found for this id :: " + categoryId));
    	assertExistingAccountType(categoryDetails);
    	final Category updatedCategory = categoryRepo.save(categoryDetails);
    	CategoryDTO newDto = new CategoryDTO(updatedCategory);
        return ResponseEntity.ok(newDto);
    }

    @DeleteMapping("/category/{id}")
    public Map<String, Boolean> deleteCategory(@PathVariable(value = "id") Long categoryId)
        throws ResourceNotFoundException, ConflictException {
        Category category = categoryRepo.findById(categoryId)
        	.orElseThrow(() -> new ResourceNotFoundException("Category not found for this id :: " + categoryId));

        if (!category.getLineItems().isEmpty()) {
        	throw new ConflictException("Please remove all LineItems from this category before deleting the category.");
        }
        categoryRepo.delete(category);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return response;
    }
    
    private void assertExistingAccountType (Category category) throws ResourceNotFoundException {
    	Long accountTypeId = category.getAccountType().getId();
    	accountTypeRepo.findById(accountTypeId)
    		.orElseThrow(() -> new ResourceNotFoundException("Account Type not found for this id :: " + accountTypeId));
    }
}
