import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  image?: string;
  dob?: string;
  gender?: string;
  roleName?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl = 'http://localhost:9000/api/users/login';
  private readonly storageKey = 'currentUser';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(credentials: { email?: string; userName?: string; password: string }): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials).pipe(
      tap(response => {
        const user: AuthUser | undefined = response?.user;
        if (user) {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.storageKey, JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch (error) {
      console.warn('Failed to parse stored user', error);
      return null;
    }
  }
}

