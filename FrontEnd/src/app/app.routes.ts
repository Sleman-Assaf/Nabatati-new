import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ModelPageComponent } from './model-page/model-page.component';
import { ChatAiComponent } from './chat-ai/chat-ai.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ExpertCvComponent } from './expert-cv/expert-cv.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard'; 
import { AccessComponent } from './access/access.component';
import { EngineerSignUpComponent } from './engenner-sign-up/engenner-sign-up.component';
import { LiveChatComponent } from './live-chat/live-chat.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'model', component: ModelPageComponent , canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },   
  { path: 'chatAi', component: ChatAiComponent , canActivate: [AuthGuard] },   
  { path: 'contactUs', component: ContactUsComponent },  
  { path: 'LogIn', component: LogInComponent },  
  { path: 'SignUp', component: SignUpComponent },  
  { path: 'Expert/:id', component: ExpertCvComponent },  
 {path:'access-declined',component:AccessComponent},
  { path: 'expertSignUp', component: EngineerSignUpComponent },
  { path: 'LiveChat', component: LiveChatComponent },
  { path: 'chat/:engineerId', component: LiveChatComponent },
  { path: 'chat/with/:engineerId', component: LiveChatComponent },       // المستخدم يفتح المحادثة مع مهندس
  { path: 'chat/session/:consultationId', component: LiveChatComponent }, // المهندس يدخل على محادثة مباشرة
  

  { path: '**', component: PageNotFoundComponent },  
];