import { Injectable } from '@angular/core';
declare const axios: any;


@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {
    let ng_this = this;

    axios.get('https://fakestoreapi.com/users')
      .then(function (response: any) {
        // handle success
        console.log(response);
      })
      .catch(function (error: any) {
        // handle error
        console.log(error);
      })
  }

  private users: any[] = [];

  getUsers(): any[] {
    return this.users;
  }


}
