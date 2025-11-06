
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, DecimalPipe } from '@angular/common';
import { Category, CategoryService } from '../service/categories-service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NgFor, DecimalPipe],
  templateUrl: './categories.html',
  styleUrl: './categories.css' // Assuming you create this file
})
export class Categories implements OnInit {

  categories: Category[] = [];
  isLoading: boolean = false;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.isLoading = false;
      }
    });
  }

  onDeleteCategory(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c._id !== id);
        },
        error: (err) => {
          console.error('Deletion failed', err);
        }
      });
    }
  }
}