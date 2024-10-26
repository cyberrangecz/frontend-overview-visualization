import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { PlayerTableData } from '../components/model/table/player-table-data';

/**
 * Communication service between table and other components
 */

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private tableRowClicked = new Subject<any>();
  private tableRowMouseover = new Subject<number>();
  private tableRowMouseout = new Subject<number>();
  private playerColorScale = new BehaviorSubject<any>(() => 'black');

  tableRowClicked$ = this.tableRowClicked.asObservable();
  tableRowMouseover$ = this.tableRowMouseover.asObservable();
  tableRowMouseout$ = this.tableRowMouseout.asObservable();
  playerColorScale$ = this.playerColorScale.asObservable();

  sendTableRowClick(player: PlayerTableData) {
    this.tableRowClicked.next(player);
  }

  sendTableRowMouseover(id: number) {
    this.tableRowMouseover.next(id);
  }

  sendTableRowMouseout(id: number) {
    this.tableRowMouseout.next(id);
  }

  sendPlayerColorScale(scale: any) {
    this.playerColorScale.next(scale);
  }
}
