import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModelServ {
  private apiUrl = 'http://127.0.0.1:8000/api/ai_model/diagnose/'; // api تبع الموديل

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<any> { // فنكشن بوخذ الصورة والتائج
    const formData = new FormData();
    formData.append('image', file); // اخذ الصورة وحفظها في متغير اسمه صورة

    return this.http.post<any>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getUserResults(token: string) {
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    // لاحظ الرابط بدون userId أو //
    return this.http.get<{ results: any[] }>(
      'http://127.0.0.1:8000/api/ai_model/diagnoses/',
      { headers }
    );
  }
}