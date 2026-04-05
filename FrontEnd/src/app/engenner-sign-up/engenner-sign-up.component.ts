import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-engineer-sign-up',
  templateUrl: './engenner-sign-up.component.html',  
  styleUrls: ['./engenner-sign-up.component.css'],
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, ReactiveFormsModule, RouterModule]
})
export class EngineerSignUpComponent {
  registerForm: FormGroup;
  selectedCvFile: File | null = null;
  errorMessage = '';
  successMessage = '';
  passwordsDoNotMatch = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      password2: ['', Validators.required],
      membershipNumber: ['', Validators.required],
      specialization: ['', Validators.required],
      cv: [null, Validators.required]  
    });
  }

  // عند اختيار الملف
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedCvFile = file;
      this.registerForm.patchValue({ cv: file });
    }
  }

  onSubmit() {
    this.passwordsDoNotMatch = false;
    this.errorMessage = '';
    this.successMessage = '';
   

    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      if (formValue.password !== formValue.password2) {
        this.passwordsDoNotMatch = true;
        return;
      }

      const formData = new FormData();
      formData.append('name', formValue.name);
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('password2', formValue.password2);
      formData.append('membership_number', formValue.membershipNumber);
      formData.append('specialization', formValue.specialization);
      formData.append('role', 'engineer');

      if (this.selectedCvFile) {
        formData.append('cv_file', this.selectedCvFile);
      }

      this.authService.registerEngineer(formData).subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          this.successMessage = 'Account created successfully!';
          this.registerForm.reset();
          this.selectedCvFile = null;
          const modal = new bootstrap.Modal(document.getElementById('successModal'));
          modal.show();
        },
        error: (err) => {
          const errorData = err.error;
          const msg = errorData?.non_field_errors?.[0];
          console.error('🔴 Registration Error:', err);
          console.error('📨 Server Response:', err.error);
        
          if (msg && msg.includes('pending approval')) {
            this.successMessage = 'Your Account Is Still Under Review.';
            return;
          }
        
          if (errorData?.email) {
            this.registerForm.get('email')?.setErrors({ emailTaken: true });
          }
          if (errorData?.name || errorData?.username) {
            this.registerForm.get('name')?.setErrors({ nameTaken: true });
          }
        
          // ✅ أضف هذا السطر هنا داخل نفس الـ error callback
          if (errorData?.membership_number) {
            this.registerForm.get('membershipNumber')?.setErrors({ membershipTaken: true });
          }
        }
      });
    }
  }

  extractErrors(errorObj: any): string {
    if (!errorObj || typeof errorObj !== 'object') return '';
    const messages = [];
    for (let key in errorObj) {
      if (Array.isArray(errorObj[key])) {
        messages.push(`${key}: ${errorObj[key].join(', ')}`);
      } else {
        messages.push(`${key}: ${errorObj[key]}`);
      }
    }
    return messages.join(' | ');
  }
}
