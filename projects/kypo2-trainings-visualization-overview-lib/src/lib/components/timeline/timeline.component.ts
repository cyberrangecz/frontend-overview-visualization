import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { GameData } from '../../shared/interfaces/game-data';
import { LineComponent } from 'kypo2-trainings-visualization-overview-lib/lib/components/timeline/line/line.component';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @Input() feedbackLearnerId: number;
  @Input() gameData: GameData;
  @Input() size: {width: number; height: number};

  @ViewChild(LineComponent) lineComponent: LineComponent;

  constructor() { }

  ngOnInit() {
  }

  getLineComponent(): LineComponent {
    return this.lineComponent;
  }

}
