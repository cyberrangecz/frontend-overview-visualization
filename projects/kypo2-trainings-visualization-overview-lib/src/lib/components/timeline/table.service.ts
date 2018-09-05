import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ProgressPlayer } from './interfaces/progress-player';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private tableRowClicked = new Subject<any>();
  private tableRowMouseover = new Subject<number>();
  private tableRowMouseout = new Subject<number>();

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

  getTableRowClicked(): Observable<any> {
    return this.tableRowClicked.asObservable();
  }

  getTableRowMouseover(): Observable<any> {
    return this.tableRowMouseover.asObservable();
  }

  getTableRowMouseout(): Observable<any> {
    return this.tableRowMouseout.asObservable();
  }
  
}
