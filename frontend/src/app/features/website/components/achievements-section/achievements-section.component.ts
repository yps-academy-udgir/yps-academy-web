import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement } from '../../models/website.models';

@Component({
  selector: 'app-achievements-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './achievements-section.component.html',
  styleUrls: ['./achievements-section.component.scss'],
})
export class AchievementsSectionComponent {
  achievements: Achievement[] = [
    { value: '5000+', label: 'Students Enrolled', icon: '🎓' },
    { value: '20+', label: 'Years of Excellence', icon: '🏆' },
    { value: '98%', label: 'Board Result', icon: '📊' },
    { value: '50+', label: 'Expert Faculty', icon: '👨‍🏫' },
    { value: '15+', label: 'Awards Won', icon: '🥇' },
    { value: '100%', label: 'Parent Satisfaction', icon: '❤️' },
  ];
}
