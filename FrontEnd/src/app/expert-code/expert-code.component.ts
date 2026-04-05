import { Component,Input } from '@angular/core';
import { ExpertCvComponent } from '../expert-cv/expert-cv.component';

@Component({
  selector: 'app-expert-code',
  standalone: true,
  imports: [ExpertCvComponent],
  templateUrl: './expert-code.component.html',
  styleUrl: './expert-code.component.css'
})
export class ExpertCodeComponent {
  @Input() Fname: string = "";
  @Input() Lname: string = "";
  @Input() magor: string = "";
  @Input() bio: string = "";
  @Input() University: string = "";
  @Input() degree: string = "";
  @Input() uniMahor: string = "";
  @Input() EngCvImgUrl: string = "";
}
