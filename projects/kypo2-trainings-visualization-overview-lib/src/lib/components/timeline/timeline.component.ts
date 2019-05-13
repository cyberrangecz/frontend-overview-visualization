import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { LineComponent } from './line/line.component';
import {GameData} from '../../shared/interfaces/game-data';
import {ConfigService} from '../../config/config.service';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnChanges {

  public gameData: GameData = {information: null, events: null}
  @Input() feedbackLearnerId: number;
  @Input() colorScheme: string[];
  @Input() size: {width: number; height: number};
  @Input() trainingDefinitionId: number;
  @Input() trainingInstanceId: number;

  @ViewChild(LineComponent) lineComponent: LineComponent;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
  }

  getLineComponent(): LineComponent {
    return this.lineComponent;
  }

}
