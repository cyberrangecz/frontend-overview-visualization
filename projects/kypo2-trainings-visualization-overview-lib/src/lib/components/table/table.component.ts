import { PLAYERS } from './../../shared/mocks/players.mock';
import { PlayerService } from './../../services/player.service';
import { Component, OnInit, Input, OnDestroy, OnChanges, ViewChild } from '@angular/core';
import { GameData } from '../../shared/interfaces/game-data';
import { DataProcessor } from '../../services/data-processor.service';
import { ProgressPlayer } from '../timeline/interfaces/progress-player';
import { TableService } from '../../services/table.service';
import { Subscription } from 'rxjs';
import { FiltersService } from '../../services/filters.service';
import { GameInformation } from '../../shared/interfaces/game-information';
import { GameEvents } from '../../shared/interfaces/game-events';
import { DataService } from '../../services/data.service';
import { ConfigService } from '../../config/config.service';
import { EMPTY_INFO, GAME_INFORMATION } from '../../shared/mocks/information.mock';
import { EMPTY_EVENTS, EVENTS } from '../../shared/mocks/events.mock';
import { Kypo2TraineeModeInfo } from '../../shared/interfaces/kypo2-trainee-mode-info';
import { take } from 'rxjs/operators';

@Component({
  selector: 'kypo2-viz-overview-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})

export class TableComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Game data
   */
  @Input() data: GameData = { information: null, events: null };
  /**
  * JSON data to use instead of data from API
  */
  @Input() jsonGameData: GameData = { information: null, events: null };
  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
  /**
   * Flag to use in standalone mode
   */
  @Input() standalone = false;
  /**
   * Id of player
   */
  @Input() feedbackLearnerId: string;
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

  public scoreTableData = { playerIds: [], levels: [], finalScores: {} };
  public playersOrdered = [];
  public sortedColumn = null;
  public sortedDesc = false;
  public columnHovered = null;
  public filters;
  private players: ProgressPlayer[];
  private playerColorScaleSource: Subscription;
  public playerColorScale = (id) => 'black';

  constructor(
    private visualizationService: DataProcessor,
    private tableService: TableService,
    private filtersService: FiltersService,
    private dataService: DataService,
    private configService: ConfigService,
    private playerService: PlayerService
  ) {
    this.playerColorScaleSource = this.tableService.playerColorScale$.subscribe(
      (scale) => {
        setTimeout(() => this.playerColorScale = scale, 0);
      }
    );
  }

  ngOnDestroy() {
    this.playerColorScaleSource.unsubscribe();
  }

  ngOnInit() {
    if (this.useLocalMock) {
      this.data = { information: GAME_INFORMATION, events: EVENTS };
      this.playerService.setPlayers(PLAYERS);
      this.redraw();
    } else {
      this.load();
    }
  }

  ngOnChanges() {
    if (this.jsonGameData !== undefined && this.jsonGameData.information !== null) {
      this.data.information = this.dataService.processInfo(this.jsonGameData.information);
      this.data.events = this.data.events === null ? EMPTY_EVENTS : this.data.events;
    }
    if (this.jsonGameData !== undefined && this.jsonGameData.events !== null) {
      this.data.events = this.dataService.processEvents(this.jsonGameData.information, this.jsonGameData.events);
      this.data.information = this.data.information === null ? EMPTY_INFO : this.data.information;
    }
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    this.redraw();
  }

  load() {
    this.dataService.getAllData(this.traineeModeInfo).pipe(take(1)).subscribe((res: [GameInformation, GameEvents]) => {
      this.data.information = res[0];
      this.data.events = res[1];

      this.redraw();
    });
  }

  redraw() {
    this.filters = this.filtersService.getFiltersObject();
    this.scoreTableData = this.getLevelScores();
    this.players = this.visualizationService.getScoreProgressPlayersWithEvents(this.data);
    this.orderPlayers();
    this.checkFeedbackLearner();
  }

  getLevelScores() {
    return this.visualizationService.getScoreTableData(this.data);
  }

  orderPlayers() {
    if (this.players === null) { return []; }
    // todo correct ordering
    // this.players.sort((player1: ProgressPlayer, player2: ProgressPlayer) => player1.id - player2.id);
    let i = 0;
    for (let index = 0; index < this.players.length; index++) {
      const element = this.players[index];
      if (element.id === this.feedbackLearnerId) {
        i = index;
        break;
      }
    }
    const copy = this.players.slice();
    const splice = copy.splice(i);
    this.playersOrdered = splice.concat(copy);
  }

  /**
   * Sets checked attribute of feedback learner in players array to true
   */
  checkFeedbackLearner() {
    if (this.players === null) { return; }
    const feedbackLearner = this.players.find((player) => player.id === this.feedbackLearnerId);
    if (feedbackLearner !== undefined) {
      feedbackLearner.checked = !feedbackLearner.checked;
    }
  }

  onRowClick(player) {
    player.checked = !player.checked;
    this.tableService.sendTableRowClick(player);
  }

  onRowMouseover(player) {
    this.tableService.sendTableRowMouseover(player.id);
  }

  onRowMouseout(player) {
    this.tableService.sendTableRowMouseout(player.id);
  }

  onWrongClick(levelNumber) {

    if (this.sortedColumn === 'w' + levelNumber) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      if (typeof this.scoreTableData.levels[levelNumber][a.id] === 'undefined' ||
        typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined') {
        return 1;
      }
      const result = this.scoreTableData.levels[levelNumber][b.id].wrongFlags -
        this.scoreTableData.levels[levelNumber][a.id].wrongFlags;
      return (this.sortedDesc) ? result : -result;
    });
    this.sortedColumn = 'w' + levelNumber;
  }

  onHintsClick(levelNumber) {

    if (this.sortedColumn === 'h' + levelNumber) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      if (typeof this.scoreTableData.levels[levelNumber][a.id] === 'undefined' ||
        typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined') {
        return 1;
      }
      const result = this.scoreTableData.levels[levelNumber][b.id].hints - this.scoreTableData.levels[levelNumber][a.id].hints;
      return (this.sortedDesc) ? result : -result;
    });
    this.sortedColumn = 'h' + levelNumber;
  }

  onLevelClick(levelNumber) {

    if (this.sortedColumn === levelNumber) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      if (typeof this.scoreTableData.levels[levelNumber][a.id] === 'undefined') {
        return -1;
      } else if (typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined') { return 1; }
      const result = this.scoreTableData.levels[levelNumber][b.id].score - this.scoreTableData.levels[levelNumber][a.id].score;
      return (this.sortedDesc) ? result : -result;
    });
    this.sortedColumn = levelNumber;
  }

  onFinalClick() {

    if (this.sortedColumn === -2) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      return (this.sortedDesc) ?
        this.scoreTableData.finalScores[b.id] - this.scoreTableData.finalScores[a.id] :
        this.scoreTableData.finalScores[a.id] - this.scoreTableData.finalScores[b.id];
    });
    this.sortedColumn = -2;
  }

  onPlayerClick() {

    if (this.sortedColumn === -1) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      return (!this.sortedDesc) ? a.id - b.id : b.id - a.id;
    });
    this.sortedColumn = -1;
  }

}
