import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FinalComponent } from './final/final.component';
import { LevelsComponent } from './levels/levels.component';
import { ConfigService } from '../../../config/config.service';
import { KypoTraineeModeInfo } from '../../../shared/interfaces/kypo-trainee-mode-info';
import { ClusteringTrainingData } from '../../model/clustering/clustering-training-data';

@Component({
  selector: 'kypo-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css'],
})
export class ClusteringComponent implements OnInit, OnChanges {
  @ViewChild(FinalComponent, { static: true }) finalComponent;
  @ViewChild(LevelsComponent, { static: true }) levelsComponent;

  public selectedTrainingRunId: number;
  clusteringTrainingData: ClusteringTrainingData = { finalResults: null, levels: null };

  /**
   * Array of color strings for visualization.
   */
  @Input() colorScheme: string[];
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
  @Input() traineeModeInfo: KypoTraineeModeInfo;
  /**
   * List of players which should be displayed
   */
  @Input() filterPlayers: number[];
  /**
   * Id of trainee which should be highlighted
   */
  @Input() highlightedTrainee: number;
  /**
   * Emits Id of trainee which should be highlighted
   */
  @Output() selectedTrainee: EventEmitter<number> = new EventEmitter();
  /**
   * Enables trainee view - defaulty highlights given trainee
   */
  @Input() standalone: boolean;
  /**
   * Id of trainees which should be displayed
   */
  @Input() displayedTrainees: number[];

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    if (this.traineeModeInfo && this.standalone) {
      this.selectedTrainingRunId = this.traineeModeInfo.trainingRunId;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;

    if ('highlightedTrainee' in changes) {
      this.selectedTrainingRunId = this.highlightedTrainee;
    }
  }

  selectPlayer(id: number): void {
    if (this.highlightedTrainee !== id) {
      this.selectedTrainee.emit(id);
    }
    this.selectedTrainingRunId = id;
  }
}
