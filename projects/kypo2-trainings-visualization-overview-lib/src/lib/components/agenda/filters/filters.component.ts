import { Component, OnInit } from '@angular/core';
import { FiltersService } from '../../../services/filters.service';

@Component({
  selector: 'kypo2-viz-overview-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent implements OnInit {
  filtersArray;

  constructor(private filtersService: FiltersService) {}

  ngOnInit() {
    this.filtersArray = this.filtersService.getFiltersArray();
  }

  onFilterChange() {
    this.filtersService.filter();
  }
}
