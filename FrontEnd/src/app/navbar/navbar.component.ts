import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../services/live-chat.service';
import { jwtDecode } from 'jwt-decode';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userEmail: string | null = '';
  userName: string | null = '';
  isLoggedIn: boolean = false;
  userRole: string | null = null;
  inbox: any[] = [];
  showActiveChats: boolean = false;
  activeChats: any[] = [];
  notifications: { message: string, consultationId: string, engineerId: string }[] = [];
  showNotificationList: boolean = false;
  showInbox: boolean = false;

 
  constructor(
    private cdr: ChangeDetectorRef,
    private chatService: ChatService,
    private router: Router,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    const email = localStorage.getItem('user_email');
    const token = localStorage.getItem('token');
  
    if (token) {
      this.isLoggedIn = true;
  
      if (email) {
        this.userName = email.split('@')[0];
      }
  
      const decoded: any = jwtDecode(token);
      this.userRole = decoded?.role || null;
  
      //  تسجيل WebSocket
      this.websocketService.register(token);
  
      // استقبال الإشعاراتة
      this.websocketService.listenForNotifications().subscribe((data) => {
        let fullMessage = data.message;
  
        if (this.userRole === 'user') {
          const engineerNames: { [id: string]: string } = {
            '17': 'Dr. Saleh Al-Shdiefat',
            '18': 'Feras Harahsheh',
            '19': 'Eng. Yousef Al-Kawaleet',
            '20': 'Sharif Al-Rawashdeh',
          };
  
          const name = engineerNames[data.engineerId] || 'المهندس';
          fullMessage += ` ${name}`;
        }
  
        this.notifications.push({
          message: fullMessage,
          consultationId: data.consultationId,
          engineerId: data.engineerId
        });
      });
  
      // إشعارات سابقة للمهندس
      if (this.userRole === 'engineer') {
        this.loadInbox();
        this.loadActiveChats();
  
        this.chatService.getEngineerConsultations('pending').subscribe({
          next: (res: any) => {
            const inboxList = res.consultations || res;
            inboxList.forEach((c: any) => {
              this.notifications.push({
                message: `New message from user :  ${c.userId}`,
                consultationId: c._id,
                engineerId: c.engineerId
              });
            });
          },
          error: (err) => {
            console.error('❌ Error loading engineer pending consultations for notification:', err);
          }
        });
      }
    }
  }
  openChatFromNotification(consultationId: string, index: number, engineerId: string) {
    console.log(' engineerId:', engineerId);  // ← هذا لازم يكون موجود
    console.log(' consultationId:', consultationId);
  
    this.notifications.splice(index, 1);
  
    if (this.userRole === 'engineer') {
      this.router.navigate([`/chat/session/${consultationId}`]);
    } else {
      this.router.navigate([`/chat/${engineerId}`]); // ← إذا engineerId فاضي، بيروح على /chat فقط
    }
  
    this.showNotificationList = false;
  }
  loadInbox() {
    this.chatService.getEngineerConsultations('pending').subscribe({
      next: (res: any) => {
        // إذا شكل الاستجابة هو { consultations: [...] }
        this.inbox = res.consultations || res;
        console.log('📥 Inbox from /engineer/pending:', this.inbox);
      },
      error: (err) => {
        console.error('❌ Error loading pending consultations:', err);
      }
    });
  }
  
  loadActiveChats() {
    this.chatService.getEngineerConsultations('active').subscribe({
      next: (res: any) => {
        console.log('📡 استجابة المحادثات الفعالة:', res);
        console.log('📃 typeof res:', typeof res);
        console.log('📚 consultations:', res.consultations);
  
        this.activeChats = res.consultations || [];
  
        console.log('✅ activeChats بعد المعالجة:', this.activeChats);
      },
      error: (err) => {
        console.error(' Error loading active consultations:', err);
      }
    });
  }

  acceptConsultation(consultationId: string) {
    this.chatService.acceptConsultation(consultationId).subscribe({
      next: () => {
        this.inbox = this.inbox.filter(n => n._id !== consultationId);
  
        //  فتح المحادثة في تبويب جديد
        window.open(`/chat/session/${consultationId}`, '_blank');
      },
      error: (err: any) => {
        console.error('❌ Error accepting consultation:', err);
      }
    });
  }

  rejectConsultation(consultationId: string) {
    console.log('Rejected consultation:', consultationId);
   
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.userName = '';
    this.userRole = null;
    this.cdr.detectChanges();
    window.location.reload();
  }
  openChat(id: string) {
    window.open(`/chat/session/${id}`, '_blank');
  }
}
