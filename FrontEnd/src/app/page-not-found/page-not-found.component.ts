import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';


import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [HomeComponent,RouterModule,],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {

}
