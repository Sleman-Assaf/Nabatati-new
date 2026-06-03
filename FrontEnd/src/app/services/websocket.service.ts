import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: Socket;

  constructor() {
    this.connect();
  }

  connect(): void {
   this.socket = io('https://chat.nabatati.it.com'); // رابط الشات عند النشر
  }

  register(token: string): void {
    this.socket.emit('register', { token });
  }

  joinRoom(consultationId: string): void {
    this.socket.emit('joinRoom', consultationId);
  }

  sendMessage(payload: { consultationId: string, senderId: string, content: string }): void {
    this.socket.emit('send_message', payload);
  }

  listenForMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('newMessage', (data) => {
        observer.next(data);
      });
    });
  }

  emitTyping(data: { consultationId: string, senderId: string }): void {
    this.socket.emit('typing', data);
  }

  listenTyping(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('typing', (data) => {
        observer.next(data);
      });
    });
  }

  emitStopTyping(data: { consultationId: string, senderId: string }): void {
    this.socket.emit('stopTyping', data);
  }

  listenStopTyping(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('stopTyping', (data) => {
        observer.next(data);
      });
    });
  }
  listenForNotifications(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('notification', (data) => {
        observer.next(data);
      });
    });
  }
}
