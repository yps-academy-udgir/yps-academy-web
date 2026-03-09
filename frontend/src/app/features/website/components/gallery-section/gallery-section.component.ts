import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryImage } from '../../models/website.models';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss'],
})
export class GallerySectionComponent {
  images: GalleryImage[] = [
    { id: 1, label: 'Annual Prize Distribution', color: '#3f51b5', icon: '🏆', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop' },
    { id: 2, label: 'Science Exhibition 2025', color: '#e91e63', icon: '🔬', image: 'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=600&h=400&fit=crop' },
    { id: 3, label: 'Classroom Sessions', color: '#4caf50', icon: '📚', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop' },
    { id: 4, label: 'Sports Day 2025', color: '#ff9800', icon: '⚽', image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop' },
    { id: 5, label: 'Board Toppers Felicitation', color: '#9c27b0', icon: '🎓', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop' },
    { id: 6, label: 'Parent-Teacher Meet', color: '#00bcd4', icon: '🤝', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop' },
    { id: 7, label: 'Republic Day Celebration', color: '#f44336', icon: '🇮🇳', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop' },
    { id: 8, label: 'Study Camp 2025', color: '#607d8b', icon: '⛺', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop' },
    { id: 9, label: 'Cultural Programme', color: '#795548', icon: '🎭', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop' },
  ];
}
