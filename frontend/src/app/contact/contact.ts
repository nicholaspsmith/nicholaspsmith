// contact.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  showCalendarModal = false;
  errorText = 'There was an error sending your message. Please try again or email me directly.';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async onSubmit(): Promise<void> {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });

    // Check if form is valid
    if (this.contactForm.invalid) {
      return;
    }

    // Reset messages
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.isSubmitting = true;

    const formData = this.contactForm.value;

    try {
      // Using FormSubmit.co - a free service for sending form data via email
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        _subject: `Portfolio Contact: ${formData.subject}`,
        _captcha: 'false',
        _template: 'table'
      };

      const response = await this.http.post(
        'https://formsubmit.co/ajax/nicholaspsmith.software@gmail.com',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).toPromise();

      // Success
      this.showSuccessMessage = true;
      this.showCalendarModal = true;
      this.contactForm.reset();

    } catch (error) {
      console.error('Error sending message:', error);
      this.showErrorMessage = true;
      this.errorText = 'There was an error sending your message. Please try again or email me directly.';

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Helper methods for template
  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get subject() {
    return this.contactForm.get('subject');
  }

  get message() {
    return this.contactForm.get('message');
  }

  closeCalendarModal(): void {
    this.showCalendarModal = false;
  }
}
