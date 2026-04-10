import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatbotComponent],
  template: `
    <router-outlet></router-outlet>
    <app-chatbot *ngIf="showChatbot"></app-chatbot>
  `
})
export class App {
  showChatbot = true;

  constructor(private router: Router) {
    this.updateChatbotVisibility(this.router.url);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateChatbotVisibility(this.router.url);
    });
  }

  private updateChatbotVisibility(url: string): void {
    this.showChatbot = !url.startsWith('/login') && !url.startsWith('/register');
  }
}
