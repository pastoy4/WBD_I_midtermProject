import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the shape of a Category object returned from the Mongoose API
export interface Category {
  _id: string; // Mongoose uses _id
  name: string; // The category name
  bookCount: number;
  description?: string;
  created_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // --- MATCHES YOUR API PORT ---
  private apiUrl = 'http://localhost:5000/api/categories';
  // -----------------------------

  constructor(private http: HttpClient) { }

  /** Fetches all categories. */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /** Adds a new category. */
  addCategory(category: { name: string, description?: string }): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  /** Updates an existing category. */
  updateCategory(id: string, category: { name?: string; description?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  /** Deletes a category by its Mongoose _id. */
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}