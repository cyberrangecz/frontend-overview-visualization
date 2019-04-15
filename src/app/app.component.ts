import { Component } from '@angular/core';
import { GAME_INFORMATION } from './mocks/information.mock';
import { EVENTS } from './mocks/events.mock';
import {DataService} from '../../projects/kypo2-trainings-visualization-overview-lib/src/lib/services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private dataService: DataService) {}

  mockFeedbackLearnerId = null;
  colorScheme = ['#307bc1', '#41ae43', '#ff9d3c', '#fc5248', '#f2d64f', '#8035c6'];
  mockGameData = {information: GAME_INFORMATION, events: EVENTS};
}
