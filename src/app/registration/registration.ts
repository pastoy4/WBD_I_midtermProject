import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UserService } from '../service/user-service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrl: './registration.css'
})
export class Registration {
  readonly days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, '0'),
    label: `${i + 1}`
  }));
  readonly months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' }
  ];
  readonly years = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: `${year}`, label: `${year}` };
  });

  message = '';
  messageClass = '';
  isSubmitting = false;

  private readonly passwordMatchValidator: ValidatorFn = (group) => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  readonly registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      dobDay: ['', [Validators.required]],
      dobMonth: ['', [Validators.required]],
      dobYear: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  isInvalid(controlName: string): boolean {
    const control = this.registrationForm.get(controlName);
    if (!control) {
      return false;
    }

    const interacted = control.dirty || control.touched;

    if (controlName === 'confirmPassword') {
      const mismatch = this.registrationForm.hasError('passwordMismatch');
      return interacted && (control.invalid || mismatch);
    }

    return control.invalid && interacted;
  }

  onSubmit(): void {
    this.message = '';
    this.messageClass = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const {
      firstName,
      lastName,
      userName,
      dobDay,
      dobMonth,
      dobYear,
      gender,
      email,
      password,
      confirmPassword
    } = this.registrationForm.value;

    const payload = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      userName: userName?.trim(),
      image: null,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      gender,
      email: email?.trim(),
      password,
      confirmPassword,
      roleName: 'user'
    };

    this.isSubmitting = true;

    this.userService.createUser(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.message = 'Account created successfully! Redirecting to log in...';
          this.messageClass = 'alert alert-success d-block';
          this.registrationForm.reset({ gender: '' });
          setTimeout(() => {
            this.router.navigate(['/login']).catch(() => { /* ignore navigation errors */ });
          }, 2000);
        },
        error: (error) => {
          const serverMessage = error?.error?.message;
          this.message = serverMessage || 'Registration failed. Please try again.';
          this.messageClass = 'alert alert-danger d-block';
        }
      });
  }
}
