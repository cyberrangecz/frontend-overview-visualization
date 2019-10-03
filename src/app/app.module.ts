import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Kypo2AuthInterceptor, Kypo2AuthModule } from 'kypo2-auth';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
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
      }),
    Kypo2AuthModule.forRoot(environment.kypo2AuthConfig)
  ],
  providers: [
    { provide: OAuthStorage, useValue: localStorage },
    { provide: HTTP_INTERCEPTORS, useClass: Kypo2AuthInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
