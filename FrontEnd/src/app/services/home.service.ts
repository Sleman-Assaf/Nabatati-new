import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  //ربطنا api home page 
  private apiUrl = 'http://127.0.0.1:8000/'; // api home page from backend

  constructor(private http: HttpClient) { }

  getHomeMessage(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}