import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'landing',
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.css']
})
export class LandComponent implements OnInit {

  constructor(
    private router: Router,
) { }

  ngOnInit(): void {
  }

  toHome(){
    this.router.navigate(['/pages/dmm-editor']);
  }

  scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToElementById(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByClass(className: string) {
    const element = document.querySelector(`.${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByTag(tagName: string) {
    const element = document.querySelector(tagName);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementBySelector(selector: string) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByQuery(query: string) {
    const element = document.querySelector(query);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToElementByName(name: string) {
    const element = document.getElementsByName(name)[0];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByIdAndClass(id: string, className: string) {

    const element = document.querySelector(`#${id}.${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByIdAndTag(id: string, tagName: string) {
    const element = document.querySelector(`#${id} ${tagName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByClassAndTag(className: string, tagName: string) {
    const element = document.querySelector(`.${className} ${tagName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementBySelectorAndQuery(selector: string, query: string) {
    const element = document.querySelector(`${selector} ${query}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToElementByQueryAndName(query: string, name: string) {
    const element = document.querySelector(`${query}[name="${name}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByNameAndClass(name: string, className: string) {
    const element = document.querySelector(`[name="${name}"].${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToElementByNameAndTag(name: string, tagName: string) {
    const element = document.querySelector(`[name="${name}"] ${tagName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
