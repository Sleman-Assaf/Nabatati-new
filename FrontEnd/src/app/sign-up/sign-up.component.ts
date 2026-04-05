import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
declare var bootstrap: any;
declare const google: any;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [NavbarComponent, FooterComponent, CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class SignUpComponent implements AfterViewInit {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  passwordsDoNotMatch = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z][a-zA-Z0-9]*$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]
      ],
      password2: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '833115228270-9ikbvo2c8nunvhe20u3o32cg3ia6d0me.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });
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

      const dataToSend = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        password2: formValue.password2,
        role: 'user'
      };

      this.authService.register(dataToSend).subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          this.successMessage = 'Account created successfully!';
          this.registerForm.reset();
          const modal = new bootstrap.Modal(document.getElementById('successModal'));
          modal.show();
        },
        error: (err) => {
          const errorData = err.error;
          if (errorData?.email) {
            this.registerForm.get('email')?.setErrors({ emailTaken: true });
          }
          if (errorData?.name || errorData?.username) {
            this.registerForm.get('name')?.setErrors({ nameTaken: true });
          }
        }
      });
    }
  }

  //  تسجيل الدخول باستخدام Google GSI


  handleCredentialResponse(response: any) {
    const token = response.credential;
    console.log("Received Google ID token:", token);

    this.http.post<any>('http://127.0.0.1:8000/auth/google/', {
      access_token: token
    }).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.successMessage = 'Google account created successfully!';
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
      },
      error: (err) => {
        console.error('Google signup error:', err);
        this.errorMessage = 'Google signup failed.';
      }
    });
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
