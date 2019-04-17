import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LineComponent } from './line/line.component';
import {EVENTS} from '../../../../../../src/app/mocks/events.mock';
import {GameData} from '../../shared/interfaces/game-data';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  public gameData: GameData = {information: null, events: EVENTS}
  @Input() feedbackLearnerId: number;
  // @Input() gameData: GameData;
  @Input() colorScheme: string[];
  @Input() size: {width: number; height: number};

  @ViewChild(LineComponent) lineComponent: LineComponent;

  constructor() { }

  ngOnInit() {
  }

  getLineComponent(): LineComponent {
    return this.lineComponent;
  }

}
