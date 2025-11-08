import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryService } from '../service/categories-service';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-category-modal.html',
  styleUrl: './add-category-modal.css'
})
export class AddCategoryModal implements OnChanges {

  @Input() isVisible: boolean = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() categoryToEdit: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  newCategory: { name: string; description: string } = {
    name: '',
    description: ''
  };

  errorMessage: string = '';
  isSubmitting: boolean = false;
  private editingCategoryId: string | null = null;

  constructor(private categoryService: CategoryService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryToEdit'] || changes['mode'] || changes['isVisible']) {
      if (this.mode === 'edit' && this.categoryToEdit) {
        this.populateForm(this.categoryToEdit);
      } else if (this.mode === 'add' && this.isVisible) {
        this.resetForm();
      }
    }
  }

  onSubmit(): void {
    if (!this.newCategory.name.trim()) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = {
      name: this.newCategory.name.trim(),
      description: this.newCategory.description.trim() || undefined
    };

    const request$ = this.mode === 'edit' && this.editingCategoryId
      ? this.categoryService.updateCategory(this.editingCategoryId, payload)
      : this.categoryService.addCategory(payload);

    request$.subscribe({
      next: () => {
        this.saved.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Category save failed:', err);
        this.errorMessage = err.error?.message || 'An unexpected error occurred while saving the category.';
        this.isSubmitting = false;
      }
    });
  }

  closeModal(): void {
    this.resetForm();
    this.errorMessage = '';
    this.isSubmitting = false;
    this.close.emit();
  }

  private populateForm(category: Category): void {
    this.editingCategoryId = category._id;
    this.newCategory = {
      name: category.name,
      description: category.description ?? ''
    };
  }

  private resetForm(): void {
    this.editingCategoryId = null;
    this.newCategory = { name: '', description: '' };
  }
}

