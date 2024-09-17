package com.catniverse.backend.service.category;

import com.catniverse.backend.model.Category;

import java.util.List;

public interface ImpCategoryService {
    Category getCategoryById(Long id);
    Category getCategoryByName(String name);
    List<Category> getAllCategories();
    Category addCategory(Category category);
    Category updateCategory(Category category, Long id);
    void deleteCategoryById(Long id);

}
