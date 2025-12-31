import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-slate-800 selection:text-white">
      <router-outlet></router-outlet>
      <app-ai-chatbot></app-ai-chatbot>
    </div>
  `,
  styles: [],
  standalone: false
})
export class AppComponent {
  title = 'ArogyaVault';
}
