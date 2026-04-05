import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';  
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, ReactiveFormsModule,HomeComponent],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  resetMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
  this.errorMessage = '';
  this.successMessage = '';

    if (this.loginForm.valid) {
   
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user_email', this.loginForm.value.email);
        localStorage.setItem('token', response.access);
        this.router.navigate(['/home']); 
localStorage.setItem('userId', response.user.id);
       
      },
      error: (err) => {
        const msg = err.error?.detail || err.error?.non_field_errors?.[0];

        if (msg?.includes('pending approval')) {
          this.successMessage = 'Your Account Is Under Review';
        } else {
          this.errorMessage = msg || 'Wrong! Password Or Email ';
        }
      }
    });
  }
  }
  requestPasswordReset() {
    this.resetMessage = '';
    const email = this.loginForm.get('email')?.value;
  
    if (!email || !this.loginForm.get('email')?.valid) {
      this.resetMessage = 'Enter Your Email In Email Felid! ';
      return;
    }
  
    this.authService.requestPasswordReset(email).subscribe({
      next: (res) => {
        this.resetMessage = res.message || 'Reset link sent to your email.';
      },
      error: (err) => {
        this.resetMessage = err.error?.error || 'Failed to send reset link.';
        console.error('❌ Reset error:', err);  // <== أضف هذا

      }
    });
  }
  

}
