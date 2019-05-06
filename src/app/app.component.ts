import {Component, OnInit} from '@angular/core';
import { GAME_INFORMATION } from './mocks/information.mock';
import { EVENTS } from './mocks/events.mock';
import {DataService} from '../../projects/kypo2-trainings-visualization-overview-lib/src/lib/services/data.service';
import {Router} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {authConfig} from './auth/auth.config';
import {OAuthService, JwksValidationHandler} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  mockFeedbackLearnerId = null;
  colorScheme = ['#307bc1', '#41ae43', '#ff9d3c', '#fc5248', '#f2d64f', '#8035c6'];
  mockGameData = {information: GAME_INFORMATION, events: EVENTS};

  constructor(
    private dataService: DataService,
    private oAuthService: OAuthService,
    private authService: AuthService) {}

  ngOnInit() {
    this.subscribeOIDCEvents();
    this.configureOidc();
  }
  private configureOidc() {
    this.oAuthService.setStorage(localStorage);
    this.oAuthService.configure(authConfig);
    this.oAuthService.loadDiscoveryDocument()
      .then(() => {
        this.oAuthService.tryLogin()
          .then(() => {
            this.oAuthService.tokenValidationHandler = new JwksValidationHandler();
            this.oAuthService.setupAutomaticSilentRefresh();
          });
      });
    this.authService.login();
  }

  private subscribeOIDCEvents() {
    this.oAuthService.events.subscribe(event => {
      if (event.type === 'token_refresh_error'
        || event.type === 'token_error'
        || event.type === 'silent_refresh_error'
        || event.type === 'token_validation_error') {
        console.log(event.type);
        this.authService.logout();
      }
    });
  }
}
