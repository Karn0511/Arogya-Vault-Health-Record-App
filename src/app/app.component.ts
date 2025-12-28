import { Component } from '@angular/core';
import { AiChatbotComponent } from './shared/components/ai-chatbot/ai-chatbot.component';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-ai-chatbot></app-ai-chatbot>
  `,
  styles: [],
  standalone: false
})
export class AppComponent {
  title = 'ArogyaVault';
}
