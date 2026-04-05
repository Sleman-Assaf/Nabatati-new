import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HomeService } from '../services/home.service';
import AOS from 'aos';
import { ModelPageComponent } from '../model-page/model-page.component';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ExpertCvComponent } from '../expert-cv/expert-cv.component';
import { ExpertCodeComponent } from '../expert-code/expert-code.component';
import { ChatAiComponent } from '../chat-ai/chat-ai.component';
import { RouterModule } from '@angular/router';




@Component({
  
  selector: 'app-home',

  standalone: true,
  imports: [NavbarComponent, ModelPageComponent, FooterComponent, ExpertCvComponent, ExpertCodeComponent, ChatAiComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  id: number=2;

  
  message: string = '';

  constructor(private homeService: HomeService,private router: Router, ) { }


  ngOnInit(): void { // فانكشن بتعمل انيميشن للعناصر 
    // تفعيل الأنيميشن
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true
    });

    // ربطنا ال api الي جاي من الباك وعرضنا رسالة 
    this.homeService.getHomeMessage().subscribe(data => {
      this.message = data.message;
      console.log("Home Api Is Running ! ");
    });
       

  }

    engineers = [
    {
      name: 'Dr. Saleh Al-Shdiefat',
      id: '17' // هذا هو ID من Django
    },
    {
      name: 'Feras Harahsheh',
      id: '18'
      },
     {
      name: 'Eng. Yousef Al-Kawaleet',
      id: '19'
      },
      {
      name: 'Sharif Al-Rawashdeh',
      id: '20'
      },
    
    // أضف باقي المهندسين هنا
  ];

   goToModelPage() {
    this.router.navigate(['/model']);
  }

   goToChatAi() {
    this.router.navigate(['/chatAi']);
  }
  GoTOCv() {
     this.router.navigate([`{{this.id}}`]);
  }

  contactEngineer(engineerId: string) {
    this.router.navigate(['/chat', engineerId]);
  }



galleryImages = [
  'Feature Image copy.png',
  'Feature Image-2 copy.png',
  'Feature Image-3 copy.png',
  'Feature Image (1).png',
  'Feature Image copy.png'
];

nextSlide() {
  const first = this.galleryImages.shift();
  if (first) {
    this.galleryImages.push(first);
  }
}

prevSlide() {
  const last = this.galleryImages.pop();
  if (last) {
    this.galleryImages.unshift(last);
  }
}



}