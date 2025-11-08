import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookService } from '../service/book-service'; // Assuming book.service.ts is the file name
import { AddBookModal } from '../add-book-model/add-book-model'; // <-- NEW: Import the modal component

@Component({
  selector: 'app-books',
  standalone: true,
  // 🟢 NEW: Add the modal to the component imports
  imports: [CommonModule, NgFor, DecimalPipe, DatePipe, FormsModule, AddBookModal],
  templateUrl: './books.html',
  styleUrl: './books.css'
})
export class Books implements OnInit {

  books: Book[] = [];
  filteredBooks: Book[] = [];
  // 🟢 NEW: State to control the visibility of the modal
  isModalVisible: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedBook: Book | null = null;
  searchTerm: string = '';
  deletingBookId: string | null = null;

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load books', err);
        // Handle error display
      }
    });
  }

  onDeleteBook(id: string, title: string): void {
    if (confirm(`Are you sure you want to delete the book "${title}"?`)) {
      this.deletingBookId = id;

      const previousBooks = [...this.books];
      this.books = this.books.filter(b => b._id !== id);
      this.applyFilter();
      this.cdr.detectChanges();

      this.bookService.deleteBook(id).subscribe({
        next: () => {
          console.log(`Book ID ${id} deleted.`);
          this.deletingBookId = null;
        },
        error: (err) => {
          console.error('Book deletion failed', err);
          this.books = previousBooks;
          this.applyFilter();
          this.deletingBookId = null;
          this.cdr.detectChanges();
          alert(`Failed to delete book "${title}". Please try again.`);
        }
      });
    }
  }

  // =======================================================
  // 🟢 NEW: MODAL CONTROL METHODS
  // =======================================================

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedBook = null;
    this.isModalVisible = true;
  }

  openEditModal(book: Book): void {
    this.modalMode = 'edit';
    this.selectedBook = { ...book };
    this.isModalVisible = true;
  }

  onModalClosed(): void {
    this.isModalVisible = false;
    this.selectedBook = null;
  }

  // Called when the modal successfully adds a new book
  onBookSaved(): void {
    this.onModalClosed(); // Close the modal
    this.loadBooks();    // Refresh the list to show the new book
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  trackByBookId(_index: number, book: Book): string {
    return book._id;
  }

  private applyFilter(): void {
    const rawTerm = this.searchTerm.trim();
    const term = rawTerm.toLowerCase();

    if (!term) {
      this.filteredBooks = [...this.books];
      return;
    }

    const numericTerm = Number(rawTerm);
    if (!Number.isNaN(numericTerm) && Number.isInteger(numericTerm) && numericTerm > 0) {
      const matchedByIndex = this.books[numericTerm - 1];
      this.filteredBooks = matchedByIndex ? [matchedByIndex] : [];
      return;
    }

    this.filteredBooks = this.books.filter((book) => {
      const haystack = [
        book.title,
        book.author,
        book.isbn,
        book.category,
        book.description ?? '',
        book.publishedYear?.toString() ?? ''
      ].map(value => (value ?? '').toLowerCase());
      return haystack.some(value => value.includes(term));
    });
  }
}