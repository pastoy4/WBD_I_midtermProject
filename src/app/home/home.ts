import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, AuthUser } from '../service/auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  currentUser$: Observable<AuthUser | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).catch(() => {
      // No-op
    });
  }
}
