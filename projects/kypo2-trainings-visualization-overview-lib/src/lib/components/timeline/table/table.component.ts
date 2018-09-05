import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GameData } from '../../../shared/interfaces/game-data';
import { DataProcessor } from '../../../services/data-processor.service';
import { ProgressPlayer } from '../interfaces/progress-player';
import { FILTERS_OBJECT } from '../line/filters/filters';

@Component({
  selector: 'kypo2-viz-overview-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() data: GameData;
  @Input() players: ProgressPlayer[];
  @Input() playerColorScale;
  @Input() feedbackLearnerId: number;
  @Output() rowClicked = new EventEmitter<ProgressPlayer>();
  @Output() rowMouseover = new EventEmitter<number>();
  @Output() rowMouseout = new EventEmitter<number>();

  public scoreTableData;
  public playersOrdered;
  public sortedColumn = null;
  public sortedDesc = false;
  public columnHovered = null;
  private filters;

  constructor(private visualizationService: DataProcessor) { }

  ngOnInit() {
    this.filters = FILTERS_OBJECT;
    this.scoreTableData = this.getLevelScores();
    this.orderPlayers();
  }

  getLevelScores() {
    return this.visualizationService.getScoreTableData(this.data);
  }

  orderPlayers() {
    this.players.sort((player1, player2) => +player1.id - +player2.id);
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

  onRowClick(player) {
    player.checked = !player.checked;
    this.rowClicked.emit(player);
  }

  onRowMouseover(player) {
    this.rowMouseover.emit(player.id);
  }

  onRowMouseout(player) {
    this.rowMouseout.emit(player.id);
  }

  onWrongClick(levelNumber) {

    if (this.sortedColumn == "w" + levelNumber) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      if (typeof this.scoreTableData.levels[levelNumber][a.id] === 'undefined' || typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined') {
        return 1;
      }
      const result = this.scoreTableData.levels[levelNumber][b.id].wrongFlags - this.scoreTableData.levels[levelNumber][a.id].wrongFlags;
      return (this.sortedDesc) ? result : -result;
    });
    this.sortedColumn = "w" + levelNumber;
  }

  onHintsClick(levelNumber) {

    if (this.sortedColumn == "h" + levelNumber) {
      this.playersOrdered.reverse();
      this.sortedDesc = !this.sortedDesc;
      return;
    }
    this.playersOrdered.sort((a, b) => {
      if (typeof this.scoreTableData.levels[levelNumber][a.id] === 'undefined' || typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined') {
        return 1;
      }
      const result = this.scoreTableData.levels[levelNumber][b.id].hints - this.scoreTableData.levels[levelNumber][a.id].hints;
      return (this.sortedDesc) ? result : -result;
    });
    this.sortedColumn = "h" + levelNumber;
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
      } else if (typeof this.scoreTableData.levels[levelNumber][b.id] === 'undefined')
      {return 1}
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
      return (this.sortedDesc) ? this.scoreTableData.finalScores[b.id] - this.scoreTableData.finalScores[a.id] : this.scoreTableData.finalScores[a.id] - this.scoreTableData.finalScores[b.id];
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
