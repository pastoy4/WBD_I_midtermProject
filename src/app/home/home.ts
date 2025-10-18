import { Component } from '@angular/core';
import { Users } from "../users/users";
import { RouterOutlet, RouterLink } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
