import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './contact-section.component.html',
  styleUrls: ['./contact-section.component.scss'],
})
export class ContactSectionComponent {
  mapUrl: SafeResourceUrl;
  private fb = inject(FormBuilder);

  submitted = signal(false);

  constructor(private sanitizer: DomSanitizer) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=YPS+Academy+Udgir&output=embed'
    );
}

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitted.set(true);
      this.contactForm.reset();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.submitted.set(false);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.contactForm.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }


}
