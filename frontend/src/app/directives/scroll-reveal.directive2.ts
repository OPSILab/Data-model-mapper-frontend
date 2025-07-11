import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal2]'
})
export class ScrollRevealDirective2 implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'opacity', '0');
    this.renderer.setStyle(element, 'transform', 'translateY(50px)');
    this.renderer.setStyle(element, 'transition', 'all 0.8s ease');

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
        observer.unobserve(element);
      }
    }, {
      rootMargin: '0px 0px -100px 0px', // attiva prima che entri del tutto
      threshold: 0.1
    });

    observer.observe(element);
  }
}
