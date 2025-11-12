import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the shape of a Book object
export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string; // The category name or ID reference
  description?: string;
  publishedYear?: number | null;
  stock: number;
  created_date: string;
}

export type CreateBookPayload = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  publishedYear?: number;
  stock: number;
};

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Assuming a similar API structure as categories
  private apiUrl = 'http://localhost:9001/api/books';

  constructor(private http: HttpClient) { }

  /** Fetches all books. */
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  /** Adds a new book. */
  addBook(bookData: CreateBookPayload): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, bookData);
  }

  /** Updates an existing book. */
  updateBook(id: string, bookData: Partial<CreateBookPayload>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, bookData);
  }

  /** Deletes a book by its Mongoose _id. */
  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}