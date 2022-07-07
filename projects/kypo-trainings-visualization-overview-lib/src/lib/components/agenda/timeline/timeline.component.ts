import { Component, OnChanges, Input, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { LineComponent } from './line/line.component';
import { ConfigService } from '../../../config/config.service';
import { KypoTraineeModeInfo } from '../../../shared/interfaces/kypo-trainee-mode-info';

@Component({
  selector: 'kypo-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnChanges, OnInit {
  /**
   * Defines if all players should be displayed
   */
  @Input() enableAllPlayers = true;
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

  public fullWidthTable = false;
  /**
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: KypoTraineeModeInfo;
  /**
   * Id of trainee which should be highlighted
   */
  @Input() highlightedTrainee: number;

  @Input() standalone: boolean;
  /**
   * Emits Id of trainee which should be highlighted
   */
  @Output() selectedTrainee: EventEmitter<number> = new EventEmitter();

  @ViewChild(LineComponent, { static: true }) lineComponent: LineComponent;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    if (this.traineeModeInfo) {
      this.highlightedTrainee = this.traineeModeInfo.trainingRunId;
    }
  }

  ngOnChanges(): void {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    if (this.traineeModeInfo) {
      this.configService.trainingRunId = this.traineeModeInfo.trainingRunId;
    }
  }

  setTableWidth(fullWidth: boolean): void {
    this.fullWidthTable = fullWidth;
  }

  selectPlayer(id: number): void {
    if (this.highlightedTrainee !== id) {
      this.selectedTrainee.emit(id);
    }
  }
}
