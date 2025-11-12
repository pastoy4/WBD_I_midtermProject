import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../service/user-service';
import Swal from 'sweetalert2';

declare const bootstrap: any;

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
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
  passwordMismatch = false;
  isAddSubmitted = false;
  isEditSubmitted = false;
  searchTerm = '';

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((res: any) => {
      this.users = Array.isArray(res) ? res : (res?.data ?? []);
      this.applyFilter();
    });
  }

  saveUser(form: NgForm, modalId: string) {
    if (this.isEdit) {
      this.isEditSubmitted = true;
    } else {
      this.isAddSubmitted = true;
    }

    if (form.invalid) {
      this.cdr.detectChanges();
      return;
    }

    if (!this.isEdit) {
      if (this.user.password !== this.user.confirmPassword) {
        this.passwordMismatch = true;
        this.cdr.detectChanges();
        return;
      }
      this.passwordMismatch = false;
    } else {
      if (this.user.password || this.user.confirmPassword) {
        if (this.user.password !== this.user.confirmPassword) {
          this.passwordMismatch = true;
          this.cdr.detectChanges();
          return;
        }
      }
      this.passwordMismatch = false;
    }

    const proceedCreate = () => {
      if (this.isEdit) {
        const updatePayload = { ...this.user };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        if (!updatePayload.confirmPassword) {
          delete updatePayload.confirmPassword;
        }

        this.userService.updateUser(this.editId, updatePayload).subscribe(() => {
          this.getUsers();
          this.resetForm();
          form.resetForm(this.user);
          this.showToast('User updated successfully', 'success');
          this.closeModal(modalId);
        });
      } else {
        this.userService.createUser(this.user).subscribe(() => {
          this.getUsers();
          this.resetForm();
          form.resetForm(this.user);
          this.showToast('User created successfully', 'success');
          this.closeModal(modalId);
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
    this.user = { ...p };
    this.user.password = '';
    this.user.confirmPassword = '';
    this.editId = p._id;
    this.isEdit = true;
    this.selectedImageFile = null;
    this.isAddSubmitted = false;
    this.isEditSubmitted = false;
    this.passwordMismatch = false;
  }

  deleteUser(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe(() => {
          this.getUsers();
          this.showToast('User deleted successfully', 'success');
        }, () => {
          this.showToast('Failed to delete user', 'danger');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.showToast('Deletion cancelled', 'info');
      }
    });
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

  prepareCreate() {
    this.resetForm();
  }

  onPasswordFieldsChange() {
    if (!this.user.password && !this.user.confirmPassword) {
      this.passwordMismatch = false;
      return;
    }

    this.passwordMismatch = this.user.password !== this.user.confirmPassword;
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
    this.passwordMismatch = false;
    this.isAddSubmitted = false;
    this.isEditSubmitted = false;
    this.searchTerm = '';
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
      this.cdr.detectChanges();
      return;
    }

    this.filteredUsers = this.users.filter((user) => {
      const fields = [
        user.firstName,
        user.lastName,
        user.userName,
        user.email,
        user.gender,
        user.roleName
      ];
      return fields.some((field) => (field || '').toString().toLowerCase().includes(term));
    });
    this.cdr.detectChanges();
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

  private closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) { return; }

    let modalInstance = bootstrap?.Modal?.getInstance(modalElement);
    if (!modalInstance && bootstrap?.Modal) {
      modalInstance = new bootstrap.Modal(modalElement);
    }

    modalInstance?.hide();
  }
}