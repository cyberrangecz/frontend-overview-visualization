import { NgModule } from '@angular/core';
import { Kypo2TrainingsVisualizationOverviewLibComponent } from './kypo2-trainings-visualization-overview-lib.component';
import { D3Service } from 'd3-ng2-service';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ClusteringComponent } from './components/clustering/clustering.component';
import { FinalComponent } from './components/clustering/final/final.component';
import { LevelsComponent } from './components/clustering/levels/levels.component';
import { LineComponent } from './components/timeline/line/line.component';
import { TableComponent } from './components/table/table.component';
import { DataProcessor } from './services/data-processor.service';
import { DataService } from './services/data.service';
import { TimeService } from './services/time.service';
import { ScoreService } from './services/score.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FILTERS_ARRAY } from './components/timeline/line/filters/filters';
import { FiltersComponent } from './components/filters/filters.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    Kypo2TrainingsVisualizationOverviewLibComponent, 
    TimelineComponent, 
    ClusteringComponent, 
    FinalComponent, 
    LevelsComponent, 
    LineComponent, 
    TableComponent, FiltersComponent
  ],
  exports: [
    Kypo2TrainingsVisualizationOverviewLibComponent,
    TimelineComponent,
    ClusteringComponent,
    TableComponent
  ],
  providers: [
    D3Service,
    DataProcessor,
    DataService,
    ScoreService,
    TimeService
  ]
})
export class Kypo2TrainingsVisualizationOverviewLibModule { }
