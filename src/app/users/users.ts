import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../service/user-service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: any[] = [];
  // Initialize the user object with necessary fields, including image
  user: any = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    image: '',
    roleName: ''
  };
  isEdit = false;
  editId: string = '';
  selectedImageFile: File | null = null;
  toast: { show: boolean; message: string; type: 'success' | 'danger' | 'info' | 'warning' } = { show: false, message: '', type: 'success' };

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((res: any) => {
      this.users = Array.isArray(res) ? res : (res?.data ?? []);
      this.cdr.detectChanges();
    });
  }

  saveUser() {
    const proceedCreate = () => {
      if (this.isEdit) {
        this.userService.updateUser(this.editId, this.user).subscribe(() => {
          this.getUsers();
          this.resetForm();
          this.showToast('User updated successfully', 'success');
        });
      } else {
        this.userService.createUser(this.user).subscribe(() => {
          this.getUsers();
          this.resetForm();
          this.showToast('User created successfully', 'success');
        });
      }
    };

    if (this.selectedImageFile && !this.user.image) {
      this.userService.uploadImage(this.selectedImageFile).subscribe((res: any) => {
        // Expecting backend returns image URL. Adjust key if different (e.g., res.url or res.imageUrl)
        this.user.image = res?.url || res?.imageUrl || '';
        proceedCreate();
      }, () => proceedCreate());
    } else {
      proceedCreate();
    }
  }

  editUser(p: any) {
    // Spread operator copies all properties from the user object 'p'
    this.user = { ...p, confirmPassword: p.password }; // Add confirmPassword for edit modal
    this.editId = p._id;
    this.isEdit = true;
  }

  deleteUser(id: string) {
    if (confirm('Are you sure to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.getUsers();
      });
    }
  }

  onFileSelected(event: any) {
    const file: File | null = event?.target?.files?.[0] || null;
    this.selectedImageFile = file;
  }

  uploadSelectedImage() {
    if (!this.selectedImageFile) { return; }
    this.userService.uploadImage(this.selectedImageFile).subscribe((res: any) => {
      this.user.image = res?.url || res?.imageUrl || '';
    });
  }

  resetForm() {
    // Reset to the initial state
    this.user = {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      dob: '',
      image: '',
      roleName: ''
    };
    this.isEdit = false;
    this.selectedImageFile = null;
  }

  private showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 2500);
  }
}