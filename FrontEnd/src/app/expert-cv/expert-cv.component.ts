import { Component,AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ExpertCodeComponent } from '../expert-code/expert-code.component';
import { ActivatedRoute } from '@angular/router';
import { Carousel } from 'bootstrap';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-expert-cv',
  standalone: true,
  imports: [NavbarComponent,FooterComponent,ExpertCodeComponent,RouterModule],
  templateUrl: './expert-cv.component.html',
  styleUrl: './expert-cv.component.css'
})
export class ExpertCvComponent implements AfterViewInit {
   constructor(
  private route: ActivatedRoute,
  private router: Router // 
) {}
 
  ngAfterViewInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!isNaN(id)) {
        setTimeout(() => this.activateCarouselItem(id), 300); // ظهور صفحة المهندس بعد 3 ثواني
      }
    });
  }

  activateCarouselItem(index: number) {
    const carouselElement = document.querySelector('#carouselExample') as HTMLElement;
    if (carouselElement) {
      const carousel = new Carousel(carouselElement);
      carousel.to(index);
    } else {
        this.router.navigate(['/']);
    }
  }
}

