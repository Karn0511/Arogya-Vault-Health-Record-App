import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Add welcome message
    this.messages.push({
      role: 'ai',
      content: 'Hello! I\'m Arogya AI, your health assistant. How can I help you today?',
      timestamp: new Date()
    });
  }

  ngOnDestroy(): void {
    // Component cleanup will be handled automatically
    this.messages = [];
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  async sendMessage(): Promise<void> {
    if (!this.userMessage.trim() || this.isLoading) {
      return;
    }

    const message = this.userMessage.trim();
    this.userMessage = '';

    // Add user message
    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    this.isLoading = true;

    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.post<{ success: boolean; response: string; fallback?: string }>(
        `${environment.apiUrl}/ai/chat`,
        { message, context: {} },
        { headers }
      ).toPromise();

      // Add AI response
      this.messages.push({
        role: 'ai',
        content: response?.response || response?.fallback || 'I apologize, but I couldn\'t process your request.',
        timestamp: new Date()
      });

      // Scroll to bottom
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Chat error:', error);
      this.messages.push({
        role: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  clearChat(): void {
    this.messages = [{
      role: 'ai',
      content: 'Hello! I\'m Arogya AI, your health assistant. How can I help you today?',
      timestamp: new Date()
    }];
  }
}
