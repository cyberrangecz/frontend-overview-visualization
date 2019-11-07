import { PlayerService } from './../../services/player.service';
import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { GameData } from '../../shared/interfaces/game-data';
import { ClusteringFinalEventService } from './interfaces/clustering-final-event-service';
import { FinalComponent } from './final/final.component';
import { LevelsComponent } from './levels/levels.component';
import { ConfigService } from '../../config/config.service';
import { GAME_INFORMATION } from '../../shared/mocks/information.mock';
import { EVENTS } from '../../shared/mocks/events.mock';
import { PLAYERS } from '../../shared/mocks/players.mock';
import { Kypo2TraineeModeInfo } from '../../shared/interfaces/kypo2-trainee-mode-info';

@Component({
  selector: 'kypo2-viz-overview-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.css']
})
export class ClusteringComponent implements OnInit, OnChanges {

  @ViewChild(FinalComponent, { static: true }) finalComponent;
  @ViewChild(LevelsComponent, { static: true }) levelsComponent;

  public selectedPlayerId: number;
  public gameData: GameData = { information: null, events: null };
  /**
  * JSON data to use instead of data from API
  */
  @Input() jsonGameData: GameData;
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
  * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
  */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;

  constructor(private configService: ConfigService,
    private playerService: PlayerService) { }

  ngOnInit() {
    if (this.useLocalMock) {
      this.gameData = { information: GAME_INFORMATION, events: EVENTS };
      this.playerService.setPlayers(PLAYERS);
    }
  }


  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
  }

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
