import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModelServ } from '../services/model-serv.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { ExpertCvComponent } from '../expert-cv/expert-cv.component';

@Component({
  selector: 'app-model-page',
  standalone: true,
  imports: [NavbarComponent, CommonModule,FooterComponent,ExpertCvComponent],
  templateUrl: './model-page.component.html',
  styleUrl: './model-page.component.css'
})
export class ModelPageComponent {
  userResults: any[] = [];
  @ViewChild('resultSection') resultSection!: ElementRef;
  selectedImage: File | null = null; //اختيار الصورة 
  result: any;
  progress = 0; // لعمل شريط تحميل
  isUploading = false;
  showFileName: boolean = false; // لعرض اسم الملف

  imagePreviewUrl: string = 'defultsPhoto1.png'; // حفظ مسار الصورة الافتراضية 
  finalImageUrl: string = ''; // الصورة النهائية 
  imageUploaded: boolean = false;


  constructor(private imageService: ModelServ) { }

  onFileSelected(event: any) { // فنكشن عند اختيار الصورة
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) { // اذا تم رفع الصورة بنجاح
      this.selectedImage = input.files[0]; // بنحفظ الصورة في المتغير
      this.showFileName = true; // بنخلي متغير اسم الصورة ترو عشان نظهره
      this.imagePreviewUrl = URL.createObjectURL(this.selectedImage);
      
    }
  }

ngOnInit(): void {
  const token = localStorage.getItem('token');
 if (token) {
  this.imageService.getUserResults(token).subscribe({
    next: (res) => {
      console.log('✅ getUserResults response:', res);
      console.log('✅ results length:', res.results?.length);
      console.log('✅ latest result from API:', res.results?.[res.results.length - 1]);

      this.userResults = [...res.results].reverse();
    },
    error: (err) => {
      console.error('❌ فشل إعادة تحميل السجل:', err);
    }
  });
} else {
    console.warn('⚠️ لا يوجد توكن في التخزين');
  }
}

 upload() {
  if (!this.selectedImage) return;

  this.imageUploaded = true;
  this.showFileName = false;
  this.isUploading = true;
  this.progress = 0;

  this.finalImageUrl = this.imagePreviewUrl;

  this.imageService.uploadImage(this.selectedImage).subscribe({
    next: (event: HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      } 
      else if (event.type === HttpEventType.Response) {
        this.result = event.body;
        console.log('🔥 النتيجة المستلمة:', this.result);

        const token = localStorage.getItem('token');

        if (token) {
          this.imageService.getUserResults(token).subscribe({
            next: (res) => {
              this.userResults = [...res.results].reverse();
              this.isUploading = false;

              setTimeout(() => {
                const offset = this.resultSection.nativeElement.offsetTop;
                window.scrollTo({
                  top: offset - 100,
                  behavior: 'smooth'
                });
              }, 300);
            },
            error: (err) => {
              console.error('❌ فشل إعادة تحميل السجل:', err);
              this.isUploading = false;
            }
          });
        } else {
          this.isUploading = false;
        }
      }
    },
    error: (error) => {
      console.error('Upload error:', error);
      this.isUploading = false;
    }
  });
}
}