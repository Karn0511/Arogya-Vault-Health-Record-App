import { Component, OnInit } from '@angular/core';
import { AiService, ChatResponse } from '@core/services/ai.service';
import { AuthService } from '@core/services/auth.service';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  isLoading?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss'],
})
export class AIAssistantComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  input = '';
  isLoading = false;
  selectedImage: string | null = null;

  userName = 'User';

  constructor(
    private aiService: AiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.fullName.split(' ')[0];
    }
  }

  toggleAssistant(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({
        id: '0',
        role: 'model',
        text: `Hello ${this.userName}! I'm your ArogyaVault AI assistant. How can I help you with your health records today? You can ask me to summarize documents, explain medical terms, or provide health insights.`,
      });
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.input.trim() && !this.selectedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: this.input,
      image: this.selectedImage || undefined,
    };

    this.messages.push(userMessage);
    this.input = '';
    this.selectedImage = null;
    this.isLoading = true;

    const botMessageId = (Date.now() + 1).toString();
    this.messages.push({
      id: botMessageId,
      role: 'model',
      text: '',
      isLoading: true,
    });

    try {
      // Call backend AI chat endpoint
      this.aiService.chat(userMessage.text, {
        image: userMessage.image,
        history: this.messages.filter((m) => !m.isLoading && m.id !== userMessage.id && m.id !== botMessageId)
          .slice(-5) // Send last 5 messages for context
          .map(m => ({ role: m.role, text: m.text }))
      }).subscribe({
        next: (response: ChatResponse) => {
          if (response.success && response.response) {
            this.updateBotMessage(botMessageId, response.response, []);
            this.markBotMessageComplete(botMessageId);
          } else {
            throw new Error('Failed to get response from AI');
          }
        },
        error: (error) => {
          console.error('AI chat error:', error);
          const errorMessage = error?.error?.message || error?.message || 'Sorry, something went wrong. Please try again.';
          this.updateBotMessage(botMessageId, errorMessage, []);
          this.markBotMessageComplete(botMessageId);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sorry, something went wrong.';
      this.updateBotMessage(botMessageId, errorMessage, []);
      this.markBotMessageComplete(botMessageId);
      this.isLoading = false;
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
  }

  private updateBotMessage(id: string, text: string, sources?: unknown[]): void {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, text, sources: (sources || []) as GroundingSource[] } : m
    );
  }

  private markBotMessageComplete(id: string): void {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, isLoading: false } : m
    );
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}
