import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { ProgressPlayer } from './interfaces/progress-player';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private tableRowClicked = new Subject<any>();
  private tableRowMouseover = new Subject<number>();
  private tableRowMouseout = new Subject<number>();
  private playerColorScale = new BehaviorSubject<any>((playerId: string) => "black");

  tableRowClicked$ = this.tableRowClicked.asObservable();
  tableRowMouseover$ = this.tableRowMouseover.asObservable();
  tableRowMouseout$ = this.tableRowMouseout.asObservable();
  playerColorScale$ = this.playerColorScale.asObservable();
  

  constructor() { }

  sendTableRowClick(player: ProgressPlayer) {
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
