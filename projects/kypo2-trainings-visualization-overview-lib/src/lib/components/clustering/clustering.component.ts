import { Component, OnInit, Input } from '@angular/core';
import {GameData} from '../../shared/interfaces/game-data';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css']
})
export class ClusteringComponent implements OnInit {

  public selectedPlayerId: number;
  @Input() feedbackLearnerId: number;
  @Input() gameData: GameData;

  constructor() { }

  ngOnInit() {
  }

  selectPlayer(id) {
    this.selectedPlayerId = id;
  }

}
