import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../service/auth-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  credentials = {
    identifier: '',
    password: ''
  };
  loading = false;
  errorMessage = '';
  private returnUrl = '/home';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const redirect = this.route.snapshot.queryParamMap.get('returnUrl');
    if (redirect) {
      this.returnUrl = redirect;
    }

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]).catch(() => {
        // navigation failure handled silently
      });
    }
  }

  onSubmit(): void {
    const { identifier, password } = this.credentials;
    if (!identifier || !password) {
      this.errorMessage = 'Please enter your email or username and password.';
      return;
    }

    const payload = identifier.includes('@')
      ? { email: identifier.trim(), password }
      : { userName: identifier.trim(), password };

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]).catch(() => {
            // No-op
          });
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
        }
      });
  }
}
