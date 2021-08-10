import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges } from '@angular/core';
import { ClusteringFinalEventService } from './interfaces/clustering-final-event-service';
import { FinalComponent } from './final/final.component';
import { LevelsComponent } from './levels/levels.component';
import { ConfigService } from '../../../config/config.service';
import { Kypo2TraineeModeInfo } from '../../../shared/interfaces/kypo2-trainee-mode-info';
import { ClusteringTrainingData } from '../../model/clustering/clustering-training-data';
import { CLUSTERING_TRAINING_LEVELS, CLUSTERING_TRAINING_RESULTS } from '../../../shared/mocks/clustering.mock';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css'],
})
export class ClusteringComponent implements OnInit, OnChanges {
  @ViewChild(FinalComponent, { static: true }) finalComponent;
  @ViewChild(LevelsComponent, { static: true }) levelsComponent;

  public selectedTrainingRunId: number;
  clusteringTrainingData: ClusteringTrainingData = { finalResults: null, levels: null };

  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
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
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    if (this.useLocalMock) {
      this.clusteringTrainingData = { finalResults: CLUSTERING_TRAINING_RESULTS, levels: CLUSTERING_TRAINING_LEVELS };
    }
    if (this.traineeModeInfo) {
      this.selectedTrainingRunId = this.traineeModeInfo.trainingRunId;
    }
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
  }

  selectPlayer(id: number) {
    this.selectedTrainingRunId = id;
  }
}
