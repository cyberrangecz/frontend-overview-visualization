import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FiltersService } from '../../../services/filters.service';

@Component({
  selector: 'kypo2-viz-overview-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent implements OnInit {

  @Output() activeFilters: EventEmitter<any> = new EventEmitter();
  filtersArray;

  constructor(private filtersService: FiltersService) {}

  ngOnInit(): void {
    this.filtersArray = this.filtersService.getFiltersArray();
  }

  onFilterChange(): void {
    this.filtersService.filter();
    this.activeFilters.emit(this.filtersService.getFiltersObject());
  }
}
