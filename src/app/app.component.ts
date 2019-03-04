import { Component } from '@angular/core';
import { GAME_INFORMATION } from './mocks/information.mock';
import { EVENTS } from './mocks/events.mock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mockFeedbackLearnerId = null;
  colorScheme = ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'];
  mockGameData = {information: GAME_INFORMATION, events: EVENTS};
}
