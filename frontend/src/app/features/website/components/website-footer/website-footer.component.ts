import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-website-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './website-footer.component.html',
  styleUrls: ['./website-footer.component.scss'],
})
export class WebsiteFooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#achievements' },
    { label: 'Courses', href: '#courses' },
    { label: 'Faculty', href: '#faculty' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  courses = [
    'SSC (Std 5 – 10)',
    'HSC Foundation',
    'JEE Foundation',
    'NEET Foundation',
  ];

  scrollTo(event: Event, href: string): void {
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
