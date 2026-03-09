import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../../models/website.models';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss'],
})
export class TestimonialsSectionComponent implements OnInit, OnDestroy {
  activeIndex = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  testimonials: Testimonial[] = [
    { id: 1, name: 'Riya Kapoor', standard: 'Class 10 – 2025', review: 'YPS Academy transformed my approach to studying. I scored 95% in boards thanks to the dedicated faculty and structured study material.', rating: 5, initials: 'RK' },
    { id: 2, name: 'Arjun Verma', standard: 'Class 9 – 2025', review: 'The teachers here are amazing! They explain every concept so clearly and are always available for doubt sessions. Highly recommend!', rating: 5, initials: 'AV' },
    { id: 3, name: 'Sneha Patil', standard: 'Class 8 – 2025', review: 'I was struggling with Mathematics but after joining YPS, my confidence grew tremendously. The practice tests really helped me improve.', rating: 5, initials: 'SP' },
    { id: 4, name: 'Rahul Desai', standard: 'Class 10 – 2024', review: 'Best coaching institute in the city. The JEE Foundation batch helped me understand concepts that most students learn much later.', rating: 5, initials: 'RD' },
    { id: 5, name: 'Priya Nair', standard: 'Class 7 – 2025', review: 'The NEET Foundation program is excellent. My biology has improved so much. The faculty makes learning fun and engaging!', rating: 5, initials: 'PN' },
  ];

  ratings = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.activeIndex.update((i) => (i + 1) % this.testimonials.length);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
  }
}
