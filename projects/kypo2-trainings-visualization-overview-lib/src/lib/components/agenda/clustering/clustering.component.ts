import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { ClusteringFinalEventService } from './interfaces/clustering-final-event-service';
import { FinalComponent } from './final/final.component';
import { LevelsComponent } from './levels/levels.component';
import { ConfigService } from '../../../config/config.service';
import { Kypo2TraineeModeInfo } from '../../../shared/interfaces/kypo2-trainee-mode-info';
import { ClusteringGameData } from '../../model/clustering/clustering-game-data';
import { CLUSTERING_GAME_LEVELS, CLUSTERING_GAME_RESULTS } from '../../../shared/mocks/clustering.mock';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css'],
})
export class ClusteringComponent implements OnInit, OnChanges {
  @ViewChild(FinalComponent, { static: true }) finalComponent;
  @ViewChild(LevelsComponent, { static: true }) levelsComponent;

  public selectedPlayerId: number;
  clusteringGameData: ClusteringGameData = { finalResults: null, levels: null };

  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
  /**
   * Id of player
   */
  @Input() feedbackLearnerId: string;
  /**
   * Array of color strings for visualization.
   */
  @Input() colorScheme: string[];
  /**
   * Service containing event handlers which are invoked whenever the visualization's events are fired.
   */
  @Input() eventService: ClusteringFinalEventService;
  /**
   * Main svg dimensions.
   */
  @Input() size: { width: number; height: number };
  /**
   * Id of training definition
   */
  @Input() trainingDefinitionId: number;
  /**
   * Id of training instance
   */
  @Input() trainingInstanceId: number;
  /**
   * Id of training run
   */
  @Input() trainingRunId: number;
  /**
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    if (this.useLocalMock) {
      this.clusteringGameData = { finalResults: CLUSTERING_GAME_RESULTS, levels: CLUSTERING_GAME_LEVELS };
    }
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    this.configService.trainingRunId = this.trainingRunId;
  }

  get levelsCount() {
    return this.clusteringGameData.levels.length;
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
