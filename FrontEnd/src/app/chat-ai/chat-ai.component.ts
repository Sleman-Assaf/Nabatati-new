import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatAiService } from '../services/smartchat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent implements AfterViewChecked {

  userMessage = ''; // متغير لرسائل اليوزر
  aiResponse = ''; // متغير لرسائل الشات
  isTyping = false;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor(private chatService: ChatAiService) { }

  messages: { sender: 'user' | 'bot', text: string }[] = []; // array لحفظ السجل كامل من الرسائل

  send() {
    const messageText = this.userMessage.trim();
    if (!messageText) return;

    // أضف رسالة المستخدم
    this.messages.push({ sender: 'user', text: messageText });

    // امسح حقل الإدخال
    this.userMessage = '';
    this.isTyping = true;

    // اطلب الرد من الـ API
    this.chatService.sendMessage(messageText).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'bot', text: res.response });
        this.isTyping = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.messages.push({ sender: 'bot', text: 'حدث خطأ أثناء المعالجة' });
        this.isTyping = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scrolling failed:', err);
    }
  }

  //  دالة تنسيق الرد من البوت لإظهار كل سطر جديد
  formatMessage(text: string): string {
    return text
      .replace(/\*/g, '') // يحذف كل النجوم
      .split('\n')         // يفصل كل سطر
      .map(line => `<p>${line.trim()}</p>`) // يلف كل سطر داخل <p>
      .join('');
  }

}
