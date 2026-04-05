import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    const token = localStorage.getItem('access_token');

    if (!token) {
      this.errorMessage = 'SignUp Or Login to send message!';
      return;
    }

    if (this.contactForm.valid) {
      this.contactService.sendMessage(this.contactForm.value).subscribe({
        next: () => {
          this.successMessage = 'message sent!';
          this.contactForm.reset();
        },
        error: () => {
          this.errorMessage = 'unsent message try again!';
        }
      });
    }
  }
}