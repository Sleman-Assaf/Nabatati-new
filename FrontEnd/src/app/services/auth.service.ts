import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/register/'; //عنوان التسجيل
  private loginUrl = 'http://localhost:8000/api/login/'; //عنوان تسجيل الدخول
    private engineerRegisterUrl = 'http://127.0.0.1:8000/api/register/engineer/'; //تسجيل المهندسين

  
  

  constructor(private http: HttpClient) {}
//تسجيل الحساب
  register(userData: any): Observable<any> {
   
    const payload = {
      ...userData,
      role: 'user'
    };

    return this.http.post(this.apiUrl, payload);
  }

   registerEngineer(formData: FormData): Observable<any> {
    return this.http.post(this.engineerRegisterUrl, formData);
  }

  // الدخول
  login(credentials: any): Observable<any> {
    return this.http.post(this.loginUrl, credentials);
  }

  requestPasswordReset(email: string) {
    return this.http.post<any>('http://127.0.0.1:8000/api/password-reset/request/', { email });
  }
  
}