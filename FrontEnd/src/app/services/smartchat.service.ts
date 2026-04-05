import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatAiService {

  private apiUrl = 'http://127.0.0.1:8000/ask/'; // ؤابط api 

  constructor(private http: HttpClient) {}

sendMessage(question: string) {
  return this.http.post<any>('http://127.0.0.1:8000/ask/', {
    question: question // 
  });
}
}