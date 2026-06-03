import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  //ربطنا api home page 
 private apiUrl = 'https://api.nabatati.it.com/'; // api home page from backend

  constructor(private http: HttpClient) { }

  getHomeMessage(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}