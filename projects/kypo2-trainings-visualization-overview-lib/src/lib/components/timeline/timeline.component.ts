import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { LineComponent } from './line/line.component';
import {GameData} from '../../shared/interfaces/game-data';
import {ConfigService} from '../../config/config.service';
import {GAME_INFORMATION} from '../../../../../../src/app/mocks/information.mock';
import {EVENTS} from '../../../../../../src/app/mocks/events.mock';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnChanges {

  public gameData: GameData = {information: null, events: null}
  @Input() useLocalMock = false;
  @Input() feedbackLearnerId: string;
  @Input() colorScheme: string[];
  @Input() size: {width: number; height: number};
  @Input() trainingDefinitionId: number;
  @Input() trainingInstanceId: number;

  @ViewChild(LineComponent) lineComponent: LineComponent;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    if (this.useLocalMock) { this.gameData = {information: GAME_INFORMATION, events: EVENTS}; }
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
  }

  getLineComponent(): LineComponent {
    return this.lineComponent;
  }

}
