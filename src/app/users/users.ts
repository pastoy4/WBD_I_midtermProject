import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((res: any) => {
      // Assuming 'res' is an array of users
      this.users = res;
    });
  }

  saveUser() {
    if (this.isEdit) {
      // NOTE: Update logic for PUT is separate and might not require confirmPassword
      this.userService.updateUser(this.editId, this.user).subscribe(() => {
        this.getUsers();
        this.resetForm();
      });
    } else {
      // Calls the corrected POST /api/users/register endpoint
      this.userService.createUser(this.user).subscribe(() => {
        this.getUsers();
        this.resetForm();
      });
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
  }
}