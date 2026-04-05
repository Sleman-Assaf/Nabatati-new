import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig = [
  provideRouter(routes),
  importProvidersFrom(HttpClientModule)
];