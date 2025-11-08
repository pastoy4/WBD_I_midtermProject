import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel binding
import { Book, BookService, CreateBookPayload } from '../service/book-service';
import { Category, CategoryService } from '../service/categories-service'; // Assuming you have a category service for the dropdown

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../add-book-model/add-book-model.html',
  styleUrl: '../add-book-model/add-book-model.css'
})
export class AddBookModal implements OnChanges {

  // Input to control modal visibility
  @Input() isVisible: boolean = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() bookToEdit: Book | null = null;

  // Output event to notify the parent (Books component) when a book is added or the modal is closed
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  // Form model for a new book (excluding _id and created_date)
  newBook: {
    title: string;
    author: string;
    isbn: string;
    category: string;
    description: string;
    publishedYear: number | null;
    stock: number;
  } = {
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publishedYear: null,
    stock: 1
  };

  categories: Category[] = []; // Used to populate the Category dropdown

  errorMessage: string = '';
  isSubmitting: boolean = false;
  private editingBookId: string | null = null;

  // You would typically inject BookService and CategoryService here
  constructor(private bookService: BookService, private categoryService: CategoryService) {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookToEdit'] || changes['mode'] || changes['isVisible']) {
      if (this.mode === 'edit' && this.bookToEdit) {
        this.populateForm(this.bookToEdit);
      } else if (this.mode === 'add' && this.isVisible) {
        this.resetForm();
      }
    }
  }

  // Fetches categories for the dropdown selector
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Could not load categories for dropdown', err)
    });
  }

  // Handle form submission
  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    const bookData: CreateBookPayload = {
      title: this.newBook.title.trim(),
      author: this.newBook.author.trim(),
      isbn: this.newBook.isbn.trim(),
      category: this.newBook.category,
      description: this.newBook.description.trim() || undefined,
      stock: Number(this.newBook.stock),
      publishedYear: this.newBook.publishedYear ? Number(this.newBook.publishedYear) : undefined
    };

    const request$ = this.mode === 'edit' && this.editingBookId
      ? this.bookService.updateBook(this.editingBookId, bookData)
      : this.bookService.addBook(bookData);

    request$.subscribe({
      next: () => {
        // Notify parent to refresh the book list
        this.saved.emit();
        // Close the modal and reset the form
        this.closeModal();
      },
      error: (err) => {
        console.error('Book save failed:', err);
        this.errorMessage = err.error?.message || 'An unexpected error occurred while saving the book.';
        this.isSubmitting = false;
      }
    });
  }

  closeModal(): void {
    this.resetForm();
    this.errorMessage = '';
    this.isSubmitting = false;
    // Emit close event
    this.close.emit();
  }

  private populateForm(book: Book): void {
    this.editingBookId = book._id;
    this.newBook = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description ?? '',
      publishedYear: book.publishedYear ?? null,
      stock: book.stock
    };
  }

  private resetForm(): void {
    this.editingBookId = null;
    this.newBook = { title: '', author: '', isbn: '', category: '', description: '', publishedYear: null, stock: 1 };
  }
}