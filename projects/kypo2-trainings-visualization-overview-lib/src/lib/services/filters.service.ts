import { Injectable } from '@angular/core';
import { FILTERS_OBJECT, FILTERS_ARRAY } from './filters/filters';
import { EMPTY, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  filtersObject;
  filtersArray;

  private filterChanged: Subject<any> = new Subject<any>();

  filterChanged$ = this.filterChanged.asObservable();

  constructor() {
    this.filtersObject = FILTERS_OBJECT;
    this.filtersArray = FILTERS_ARRAY;
  }

  getFiltersObject(): any {
    return this.filtersObject;
  }

  getFiltersArray(): any {
    return this.filtersArray;
  }

  setFilters(filters: any[]): void {
    this.filter()
  }

  filter(): void {
    this.filterChanged.next(EMPTY);
  }
}
