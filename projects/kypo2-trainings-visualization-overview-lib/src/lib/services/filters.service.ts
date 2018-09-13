import { Injectable } from '@angular/core';
import { FILTERS_OBJECT, FILTERS_ARRAY } from '../components/timeline/line/filters/filters';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  filtersObject;
  filtersArray;

  private filterChanged = new Subject<any>();

  filterChanged$ = this.filterChanged.asObservable();

  constructor() {
    this.filtersObject = FILTERS_OBJECT;
    this.filtersArray = FILTERS_ARRAY;
  }

  getFiltersObject() {
    return this.filtersObject;
  }

  getFiltersArray() {
    return this.filtersArray;
  }

  filter() {
    this.filterChanged.next();
  }
}
