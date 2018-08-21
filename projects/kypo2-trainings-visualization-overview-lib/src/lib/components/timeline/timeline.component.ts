import { Component, OnInit, Input } from '@angular/core';
import { GameData } from '../../shared/interfaces/game-data';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @Input() feedbackLearnerId: number;
  @Input() gameData: GameData;

  constructor() { }

  ngOnInit() {
  }

}
