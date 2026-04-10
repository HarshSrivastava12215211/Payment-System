import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <button class="chat-float-btn shadow-lg" (click)="toggleChat()" [class.hidden]="isOpen">
      <span class="bot-icon">💬</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window shadow-xl glass-card" [class.open]="isOpen">
      <div class="chat-header flex-between align-center p-3">
        <div class="flex align-center gap-2">
          <span class="bot-avatar">🤖</span>
          <div>
            <h4 class="m-0 font-bold text-primary">Barbarik</h4>
            <small class="text-success m-0" style="font-size: 0.7rem;">Your Personal Assistant</small>
          </div>
        </div>
        <button class="btn btn-icon btn-close" (click)="toggleChat()">✖</button>
      </div>

      <div class="chat-body" #chatBody>
        <div class="welcome-msg text-center mb-3">
          <small class="text-muted">Chat started</small>
        </div>
        
        <div *ngFor="let msg of messages" class="message-wrapper" [class.user]="msg.sender === 'user'" [class.bot]="msg.sender === 'bot'">
          <div class="message-bubble">
            <span [innerHTML]="formatMessage(msg.text)"></span>
          </div>
          <small class="msg-time">{{ msg.timestamp | date:'shortTime' }}</small>
        </div>
        
        <div *ngIf="isLoading" class="message-wrapper bot">
          <div class="message-bubble typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="chat-footer p-2 border-top">
        <form (ngSubmit)="sendMessage()" class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            name="userInput" 
            class="form-control" 
            placeholder="Ask me anything..." 
            autocomplete="off"
            [disabled]="isLoading"
          />
          <button type="submit" class="btn btn-primary btn-sm px-3" [disabled]="!userInput.trim() || isLoading">
            ▶
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Floating Button */
    .chat-float-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      z-index: 9999;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.4);
    }
    
    .chat-float-btn:hover {
      transform: scale(1.1) translateY(-5px);
    }
    
    .chat-float-btn.hidden {
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
    }

    /* Chat Window */
    .chat-window {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 350px;
      height: 500px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .chat-window.open {
      transform: scale(1);
      opacity: 1;
    }

    .chat-header {
      background: rgba(255, 255, 255, 0.8);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .bot-avatar {
      font-size: 2rem;
      background: var(--primary-light);
      border-radius: 50%;
      padding: 5px;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      color: var(--secondary);
      border-radius: 50%;
      width: 30px;
      height: 30px;
    }
    
    .btn-close:hover {
      background: rgba(0,0,0,0.05);
      color: var(--primary);
    }

    .chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(248, 250, 252, 0.5);
    }

    /* Scrollbar */
    .chat-body::-webkit-scrollbar { width: 5px; }
    .chat-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

    .message-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }

    .message-wrapper.user {
      align-self: flex-end;
      align-items: flex-end;
    }

    .message-wrapper.bot {
      align-self: flex-start;
      align-items: flex-start;
    }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 0.9rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message-wrapper.user .message-bubble {
      background: var(--primary);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-wrapper.bot .message-bubble {
      background: white;
      color: var(--text-dark);
      border: 1px solid rgba(0,0,0,0.05);
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    .msg-time {
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 4px;
      padding: 0 4px;
    }

    .chat-footer {
      background: white;
    }
    
    .chat-footer .form-control {
      border-radius: 20px;
      padding: 10px 15px;
      background: rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .chat-footer .btn {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Typing Indie */
    .typing-indicator span {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: var(--text-muted);
      border-radius: 50%;
      margin: 0 2px;
      animation: typing 1s infinite alternate;
    }
    
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
      0% { transform: translateY(0); opacity: 0.5; }
      100% { transform: translateY(-3px); opacity: 1; }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isOpen = false;
  userInput = '';
  isLoading = false;
  messages: ChatMessage[] = [];

  ngOnInit() {
    // Initial greeting
    this.messages.push({
      text: "Hello! I'm your Logic Wallet assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userText = this.userInput;
    this.userInput = '';
    
    // Add user message to UI
    this.messages.push({
      text: userText,
      sender: 'user',
      timestamp: new Date()
    });
    
    this.scrollToBottom();
    this.isLoading = true;

    // Call backend
    const uid = this.authService.getCurrentUserId()?.toString() || "guest";
    
    this.chatbotService.sendMessage({ message: userText, userId: uid }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messages.push({
          text: res.reply,
          sender: 'bot',
          timestamp: new Date()
        });
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({
          text: "I'm having trouble connecting right now. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        });
        this.scrollToBottom();
        this.cdr.detectChanges();
      }
    });
  }

  formatMessage(text: string): string {
    // Basic formatting: convert newlines to <br>, bold markdown to HTML bold
    if (!text) return '';
    let formatted = text.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formatted;
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        const body = document.querySelector('.chat-body');
        if (body) {
          body.scrollTop = body.scrollHeight;
        }
      } catch(err) {}
    }, 50);
  }
}
