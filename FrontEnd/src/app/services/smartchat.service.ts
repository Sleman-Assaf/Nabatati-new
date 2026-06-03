import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatAiService {

private apiUrl = 'https://api.nabatati.it.com/ask/'; // رابط api
  constructor(private http: HttpClient) {}

sendMessage(question: string) {
  return this.http.post<any>('https://api.nabatati.it.com/ask/', {
    question: question // 
  });
}
}