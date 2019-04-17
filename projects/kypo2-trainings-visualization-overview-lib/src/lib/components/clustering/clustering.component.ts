import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {GameData} from '../../shared/interfaces/game-data';
import { ClusteringFinalEventService } from './interfaces/clustering-final-event-service';
import { FinalComponent } from './final/final.component';
import { LevelsComponent } from './levels/levels.component';
import {GAME_INFORMATION} from '../../../../../../src/app/mocks/information.mock';
import {EVENTS} from '../../../../../../src/app/mocks/events.mock';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css']
})
export class ClusteringComponent implements OnInit {

  @ViewChild(FinalComponent) finalComponent;
  @ViewChild(LevelsComponent) levelsComponent;

  public selectedPlayerId: number;
  @Input() feedbackLearnerId: number;
  @Input() colorScheme: string[];
  // @Input() gameData: GameData;
  @Input() eventService: ClusteringFinalEventService;
  @Input() size: {width: number; height: number};

  private gameData: GameData = {information: GAME_INFORMATION, events: EVENTS};

  constructor() { }

  ngOnInit() {}

  get levelsCount() {
    return this.gameData.information.levels.length;
  }

  selectPlayer(id) {
    this.selectedPlayerId = id;
  }

  getFinalComponent(): FinalComponent {
    return this.finalComponent;
  }

  getLevelsComponent(): LevelsComponent {
    return this.levelsComponent;
  }

}
