import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthService} from './auth/auth.service';
import {OAuthModule, OAuthStorage} from 'angular-oauth2-oidc';
import {AuthHttpInterceptor} from './auth/auth-http-interceptor';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot(
      {
        resourceServer: {
          allowedUrls: [],
          sendAccessToken: true
        }
      })
  ],
  providers: [
    AuthService,
    { provide: OAuthStorage, useValue: localStorage },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
