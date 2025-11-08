
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryService } from '../service/categories-service';
import { AddCategoryModal } from '../add-category-modal/add-category-modal';
import { BookService, Book } from '../service/book-service';


@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NgFor, DecimalPipe, DatePipe, FormsModule, AddCategoryModal],
  templateUrl: './categories.html',
  styleUrl: './categories.css' // Assuming you create this file
})
export class Categories implements OnInit {

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  isModalVisible: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedCategory: Category | null = null;
  searchTerm: string = '';
  deletingCategoryId: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    // this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
        this.syncBookCountsWithBooks();
        this.cdr.detectChanges();
        // this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        // this.isLoading = false;
      }
    });
  }

  onDeleteCategory(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      this.deletingCategoryId = id;

      const previousCategories = [...this.categories];
      this.categories = this.categories.filter(c => c._id !== id);
      this.applyFilter();
      this.cdr.detectChanges();

      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.deletingCategoryId = null;
        },
        error: (err) => {
          console.error('Deletion failed', err);
          this.categories = previousCategories;
          this.applyFilter();
          this.deletingCategoryId = null;
          this.cdr.detectChanges();
          alert(`Failed to delete category "${name}". Please try again.`);
        }
      });
    }
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedCategory = null;
    this.isModalVisible = true;
  }

  openEditModal(category: Category): void {
    this.modalMode = 'edit';
    this.selectedCategory = { ...category };
    this.isModalVisible = true;
  }

  onModalClosed(): void {
    this.isModalVisible = false;
    this.selectedCategory = null;
  }

  onCategorySaved(): void {
    this.onModalClosed();
    this.loadCategories();
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  trackByCategoryId(_index: number, category: Category): string {
    return category._id;
  }

  private applyFilter(): void {
    const rawTerm = this.searchTerm.trim();
    const term = rawTerm.toLowerCase();

    if (!term) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const numericTerm = Number(rawTerm);
    if (!Number.isNaN(numericTerm) && Number.isInteger(numericTerm) && numericTerm > 0) {
      const matchedByIndex = this.categories[numericTerm - 1];
      this.filteredCategories = matchedByIndex ? [matchedByIndex] : [];
      return;
    }

    this.filteredCategories = this.categories.filter((category) => {
      const haystack = [
        category.name,
        category.description ?? ''
      ].map(value => (value ?? '').toLowerCase());
      return haystack.some(value => value.includes(term));
    });
  }

  private syncBookCountsWithBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books: Book[]) => {
        const counts = books.reduce<Record<string, number>>((acc, book) => {
          const key = book.category;
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});

        this.categories = this.categories.map(category => ({
          ...category,
          bookCount: counts[category.name] ?? 0
        }));

        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to sync book counts for categories', err);
      }
    });
  }
}