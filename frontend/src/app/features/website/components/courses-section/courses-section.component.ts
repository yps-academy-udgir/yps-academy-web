import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/website.models';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

@Component({
  selector: 'app-courses-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule],
  templateUrl: './courses-section.component.html',
  styleUrls: ['./courses-section.component.scss'],
})
export class CoursesSectionComponent {
  courses: Course[] = [
    {
      id: 1,
      title: 'SSC (Std 5 – 10)',
      description: 'Comprehensive board exam preparation covering all core subjects with expert guidance and regular mock tests.',
      duration: '1 Year',
      icon: '📘',
      badge: 'Most Popular',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'HSC Foundation',
      description: 'Build a strong foundation for Class 11 & 12 while excelling in your current standard with advanced concepts.',
      duration: '1 Year',
      icon: '📗',
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'JEE Foundation',
      description: 'Early preparation for IIT-JEE from Std 8 onwards. Covers Physics, Chemistry and Mathematics in depth.',
      duration: '2 Years',
      icon: '🔬',
      badge: 'Premium',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      title: 'NEET Foundation',
      description: 'Start your medical journey early. Biology, Physics, and Chemistry designed for aspiring doctors.',
      duration: '2 Years',
      icon: '🩺',
      badge: 'New Batch',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    },
  ];
}
