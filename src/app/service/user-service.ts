import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = 'http://localhost:9000/api/users'; // Base API URL
  private uploadUrl = 'http://localhost:9000/api/upload/image';

  constructor(private http: HttpClient){}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // <--- UPDATED ENDPOINT FOR REGISTRATION/CREATION --->
  createUser(data: any): Observable<any> {
    // Using the correct registration endpoint from user.js: POST /api/users/register
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }
  // <--- END UPDATED ENDPOINT --->

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<any>(this.uploadUrl, formData);
  }
}