import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { LineComponent } from './line/line.component';
import { ConfigService } from '../../../config/config.service';
import { Kypo2TraineeModeInfo } from '../../../shared/interfaces/kypo2-trainee-mode-info';
import { Timeline } from '../../model/timeline/timeline';
import { TIMELINE_RESULTS } from '../../../shared/mocks/timeline.mock';

@Component({
  selector: 'kypo2-viz-overview-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, OnChanges {
  public timelineData: Timeline = { timeline: null };
  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
  /**
   * Defines if all players should be displayed
   */
  @Input() enableAllPlayers = true;
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

  public fullWidthTable = false;
  /**
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;

  @ViewChild(LineComponent, { static: true }) lineComponent: LineComponent;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    if (this.useLocalMock) {
      this.timelineData = { timeline: TIMELINE_RESULTS };
    }
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    if (this.traineeModeInfo) {
      this.configService.trainingRunId = this.traineeModeInfo.trainingRunId;
    }
  }

  getLineComponent(): LineComponent {
    return this.lineComponent;
  }

  setTableWidth(fullWidth: boolean) {
    this.fullWidthTable = fullWidth;
  }
}
