import { Component, OnInit } from '@angular/core';
import { GAME_INFORMATION } from './mocks/information.mock';
import { EVENTS } from './mocks/events.mock';
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  feedbackLearnerId = 'Participant1';
  colorScheme = ['#307bc1', '#41ae43', '#ff9d3c', '#fc5248', '#f2d64f', '#8035c6'];

  constructor() { }

  ngOnInit() { }

}
