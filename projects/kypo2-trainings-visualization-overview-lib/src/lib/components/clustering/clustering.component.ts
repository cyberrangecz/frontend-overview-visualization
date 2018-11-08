import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {GameData} from '../../shared/interfaces/game-data';
import { ClusteringFinalEventService } from './interfaces/clustering-final-event-service';
import { FinalComponent } from './final/final.component';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css']
})
export class ClusteringComponent implements OnInit {

  @ViewChild(FinalComponent) finalComponent;

  public selectedPlayerId: number;
  @Input() feedbackLearnerId: number;
  @Input() gameData: GameData;
  @Input() eventService: ClusteringFinalEventService;

  constructor() { }

  ngOnInit() {
  }

  selectPlayer(id) {
    this.selectedPlayerId = id;
  }

  getFinalComponent(): FinalComponent {
    return this.finalComponent;
  }

}
