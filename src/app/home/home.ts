import { Component } from '@angular/core';
import { Users } from "../users/users";
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
