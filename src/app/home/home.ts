import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
<<<<<<< HEAD
import { Users } from "../users/users";
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
=======
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, AuthUser } from '../service/auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, RouterOutlet],
>>>>>>> sorng
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
