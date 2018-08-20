import { Component } from '@angular/core';
import { GAME_INFORMATION } from './mocks/information.mock';
import { EVENTS } from './mocks/events.mock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mockFeedbackLearnerId = 9003575;
  mockGameData = {information: GAME_INFORMATION, events: EVENTS};
}
