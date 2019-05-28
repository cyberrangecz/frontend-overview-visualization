import {Component, OnInit, Input, OnDestroy, OnChanges} from '@angular/core';
import { GameData } from '../../shared/interfaces/game-data';
import { DataProcessor } from '../../services/data-processor.service';
import { ProgressPlayer } from '../timeline/interfaces/progress-player';
import { TableService } from '../../services/table.service';
import { Subscription } from 'rxjs';
import { FiltersService } from '../../services/filters.service';
import {GameInformation} from '../../shared/interfaces/game-information';
import {GameEvents} from '../../shared/interfaces/game-events';
import {DataService} from '../../services/data.service';
import {ConfigService} from '../../config/config.service';

@Component({
  selector: 'kypo2-viz-overview-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: GameData;
  @Input() feedbackLearnerId: string;
  @Input() trainingDefinitionId: number;
  @Input() trainingInstanceId: number;

  public displayedColumns: string[];
  public dataSource = [
    {Player: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {Player: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {Player: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'}
  ];
  public scoreTableData = {playerIds: [], levels: [], finalScores: {}};
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
      private configService: ConfigService
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
    this.load();
  }

  ngOnChanges() {
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    this.filters = this.filtersService.getFiltersObject();
    this.scoreTableData = this.getLevelScores();
    this.players = this.visualizationService.getScoreProgressPlayersWithEvents(this.data);
    this.orderPlayers();
    this.checkFeedbackLearner();
  }

  load() {
    this.dataService.getAllData().subscribe((res: [GameInformation, GameEvents]) => {
      this.data.information = res[0];
      this.data.events = res[1];

      this.loadTableHeaders();
      this.filters = this.filtersService.getFiltersObject();
      this.scoreTableData = this.getLevelScores();
      this.dataSource = this.getTableData();
      this.players = this.visualizationService.getScoreProgressPlayersWithEvents(this.data);
      this.orderPlayers();
      this.checkFeedbackLearner();
    });
  }

  loadTableHeaders() {
    this.displayedColumns = ['Player'];
    this.data.information.levels.forEach((level,i) => {
      if (level.type === 'GAME_LEVEL') this.displayedColumns.push('Level ' + level.gameLevelNumber);
    });
    this.displayedColumns.push('Final');
  }

  getTableData() {
    return this.visualizationService.getScoreTableData2(this.data);
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
