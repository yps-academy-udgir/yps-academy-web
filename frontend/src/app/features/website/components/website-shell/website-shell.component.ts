import { Component, ChangeDetectionStrategy } from '@angular/core';
import { WebsiteNavbarComponent } from '../website-navbar/website-navbar.component';
import { AnnouncementBarComponent } from '../announcement-bar/announcement-bar.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { CoursesSectionComponent } from '../courses-section/courses-section.component';
import { FacultySectionComponent } from '../faculty-section/faculty-section.component';
import { AchievementsSectionComponent } from '../achievements-section/achievements-section.component';
import { TestimonialsSectionComponent } from '../testimonials-section/testimonials-section.component';
import { GallerySectionComponent } from '../gallery-section/gallery-section.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { WebsiteFooterComponent } from '../website-footer/website-footer.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-website-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WebsiteNavbarComponent,
    AnnouncementBarComponent,
    HeroSectionComponent,
    CoursesSectionComponent,
    FacultySectionComponent,
    AchievementsSectionComponent,
    TestimonialsSectionComponent,
    GallerySectionComponent,
    ContactSectionComponent,
    WebsiteFooterComponent,
    RevealOnScrollDirective,
  ],
  templateUrl: './website-shell.component.html',
  styleUrls: ['./website-shell.component.scss'],
})
export class WebsiteShellComponent {}
