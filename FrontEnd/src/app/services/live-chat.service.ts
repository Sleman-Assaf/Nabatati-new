import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private BASE_URL = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // بدء أو استرجاع محادثة
  startConsultation(engineerId: string, content: string = '') {
    const body = {
      engineerId,
      content,
      type: 'text'
    };
    return this.http.post(`${this.BASE_URL}/consultation/start`, body, {
      headers: this.getHeaders()
    });
  }

  // إرسال رسالة جديدة
  sendMessage(message: {
    consultationId: string;
    content: string;
    type: string;
  }) {
    return this.http.post(`${this.BASE_URL}/messages/send`, message, {
      headers: this.getHeaders()
    });
  }

  // جلب الرسائل من API الحقيقي
  getMessages(consultationId: string, page = 1, limit = 100): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/messages/${consultationId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }



//اشعارات لللمهندس
getInbox() {
  return this.http.get(`${this.BASE_URL}/inbox`, {
    headers: this.getHeaders()
  });
}

acceptConsultation(consultationId: string) {
  return this.http.put(`${this.BASE_URL}/engineer/${consultationId}/accept`, {}, {
    headers: this.getHeaders()
  });
  }
  getEngineerConsultations(status: string) {
    return this.http.get<any>(`${this.BASE_URL}/engineer/${status}`, {
      headers: this.getHeaders()
    });
  }





  getExistingConsultation(engineerId: string) {
    return this.http.get<any>(`${this.BASE_URL}/consultation/existing?engineerId=${engineerId}`, {
      headers: this.getHeaders()
    });
  }
  
  


  closeConsultation(id: string) {
    return this.http.delete(`${this.BASE_URL}/consultation/${id}`, {
      headers: this.getHeaders()
    });
  }

}
