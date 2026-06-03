import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/live-chat.service';
import { WebsocketService } from '../services/websocket.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';

type ChatMessage = { sender: 'user' | 'engineer'; content: string };

@Component({
  selector: 'app-live-chat',
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.css'],
  imports: [NavbarComponent, FooterComponent, FormsModule, CommonModule],
  standalone: true,
})
export class LiveChatComponent implements OnInit, OnDestroy {
  engineerId: string = '';
  consultationId: string = '';
  statusMessage: string = '';
  messageText: string = '';
  userRole: string = 'user';
  userId: string = '';
  messages: ChatMessage[] = [];
  engineerName: string = '';

  private socketSub!: Subscription;

  engineerNames: { [id: string]: string } = {
    '3': 'Dr. Saleh Al-Shdiefat',
    '5': 'Feras Harahsheh',
    '6': 'Eng. Yousef Al-Kawaleet',
    '7': 'Sharif Al-Rawashdeh',
  };

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded?.role || 'user';
      this.userId = decoded?.user_id?.toString() || ''; // تأكد أنها string
      this.websocketService.register(token);

      
    }

    const consultationParam = this.route.snapshot.paramMap.get('consultationId') || '';
    const engineerParam = this.route.snapshot.paramMap.get('engineerId') || '';

    if (consultationParam) {
      this.consultationId = consultationParam;
      this.statusMessage = '✅ تم استعادة المحادثة برقم الجلسة';
      this.websocketService.joinRoom(this.consultationId);
      this.loadMessages(); // ← لإعادة تحميل الرسائل ومن ثم التحقق من الرسالة الواحدة
      this.listenToSocket();
    } else if (engineerParam) {
      this.engineerId = engineerParam;
      this.engineerName = this.engineerNames[this.engineerId] || 'Unknown ChatRoom!';

      const storedId = localStorage.getItem(`consultation_${this.userId}_${this.engineerId}`) || '';

      if (storedId) {
        this.consultationId = storedId;
        this.statusMessage = '✅ تم استعادة المحادثة من التخزين المحلي';
        this.websocketService.joinRoom(this.consultationId);
        this.loadMessages();
        this.listenToSocket();
      } else {
        this.chatService.getExistingConsultation(this.engineerId).subscribe(
          (res: any) => {
            if (res && res._id) {
              this.consultationId = res._id;
              this.engineerId = res.engineerId?.toString() || this.engineerId;
              this.engineerName = this.engineerNames[this.engineerId] || 'غير معروف';
              localStorage.setItem(`consultation_${this.userId}_${this.engineerId}`, this.consultationId);
              this.statusMessage = '✅ تم استعادة المحادثة القائمة من الخادم';
              this.websocketService.joinRoom(this.consultationId);
              this.loadMessages();
              this.listenToSocket();
            } else {
              this.statusMessage = '🆕 لا توجد محادثة سابقة، سيتم إنشاؤها عند أول رسالة.';
            }
          },
          (err) => console.error('❌ فشل التحقق من المحادثة السابقة:', err)
        );
      }
    }
  }

  sendMessage() {
    if (this.messageText.trim()) {
      const content = this.messageText.trim();

      const msg: ChatMessage = {
        sender: this.userRole === 'engineer' ? 'engineer' : 'user',
        content
      };
      this.messages.push(msg);
      this.messageText = '';

      if (this.consultationId) {
        this.websocketService.sendMessage({
          consultationId: this.consultationId,
          senderId: this.userId, // ✅ تأكد أنها موجودة وليست null
          content
        });
      } else {
        this.chatService.startConsultation(this.engineerId, content).subscribe(
          (res: any) => {
            this.consultationId = res.consultationId || res._id;
            localStorage.setItem(`consultation_${this.userId}_${this.engineerId}`, this.consultationId);
            this.websocketService.joinRoom(this.consultationId);
            this.listenToSocket();
        
            // ✨ تأخير تحميل الرسائل قليلاً ليتمكن الخادم من حفظ أول رسالة
            setTimeout(() => {
              this.loadMessages();
            }, 300); // 300ms يكفي غالباً
          },
          (err) => {
            this.statusMessage = '❌ فشل بدء المحادثة، حاول لاحقًا.';
            console.error('❌ خطأ بدء المحادثة:', err);
          }
        );
      }
    }
  }

  listenToSocket() {
    this.socketSub = this.websocketService.listenForMessages().subscribe((data: any) => {
      if (data.consultationId === this.consultationId && data.sender.toString() !== this.userId.toString()) {
        const sender: 'user' | 'engineer' = (this.userRole === 'engineer') ? 'user' : 'engineer';
    
        this.messages.push({
          sender,
          content: data.content
        });
      }
    });
  }

  loadMessages() {
    this.chatService.getMessages(this.consultationId).subscribe(
      (res: any) => {
        const key = `pendingMessage_${this.engineerId}`;
        const pendingContent = localStorage.getItem(key) || '';
        const serverMessages = res.messages || res;

        let loadedMessages: ChatMessage[] = serverMessages.map((msg: any, i: number) => {
          let sender: 'user' | 'engineer' =
            msg.senderId == this.userId
              ? (this.userRole === 'engineer' ? 'engineer' : 'user')
              : (this.userRole === 'engineer' ? 'user' : 'engineer');

          if (i === 0 && sender === 'engineer' && pendingContent && msg.content === pendingContent) {
            sender = 'user';
            localStorage.removeItem(key);
          }

          return { sender, content: msg.content };
        });

        if (loadedMessages.length === 1 && serverMessages.length === 1) {
          const firstMsg = loadedMessages[0];
        
          if (
            firstMsg.sender === 'user' &&
            this.userRole === 'user'
          ) {
            loadedMessages.unshift({
              sender: 'engineer',
              content: 'تم استلام الرسالة، بانتظار موافقة المهندس.'
            });
          }
        
          if (
            firstMsg.sender === 'user' &&
            this.userRole === 'engineer'
          ) {
            loadedMessages.unshift({
              sender: 'engineer',
              content: 'تم استلام الرسالة، بانتظار موافقة المهندس.'
            });
          }
        }

        this.messages = loadedMessages;
      },
      (err) => console.error('❌ فشل تحميل الرسائل:', err)
    );
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}
