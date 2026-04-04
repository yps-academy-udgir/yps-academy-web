import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  private animation?: gsap.core.Tween;
  private static pluginRegistered = false;

  @Input() revealDelay = 0;
  @Input() revealY = 28;
  @Input() revealDuration = 0.65;
  @Input() revealEase = 'power2.out';

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (!RevealOnScrollDirective.pluginRegistered) {
        gsap.registerPlugin(ScrollTrigger);
        RevealOnScrollDirective.pluginRegistered = true;
      }

      this.animation = gsap.fromTo(
        this.elementRef.nativeElement,
        { y: this.revealY, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          delay: this.revealDelay,
          duration: this.revealDuration,
          ease: this.revealEase,
          scrollTrigger: {
            trigger: this.elementRef.nativeElement,
            start: 'top 86%',
            once: true,
          },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.animation?.scrollTrigger?.kill();
    this.animation?.kill();
  }
}
