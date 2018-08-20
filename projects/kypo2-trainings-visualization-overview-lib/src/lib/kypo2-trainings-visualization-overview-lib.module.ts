import { NgModule } from '@angular/core';
import { Kypo2TrainingsVisualizationOverviewLibComponent } from './kypo2-trainings-visualization-overview-lib.component';
import { D3Service } from 'd3-ng2-service';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ClusteringComponent } from './components/clustering/clustering.component';
import { FinalComponent } from './components/clustering/final/final.component';
import { LevelsComponent } from './components/clustering/levels/levels.component';
import { LineComponent } from './components/timeline/line/line.component';
import { TableComponent } from './components/timeline/table/table.component';

@NgModule({
  imports: [
  ],
  declarations: [Kypo2TrainingsVisualizationOverviewLibComponent, TimelineComponent, ClusteringComponent, FinalComponent, LevelsComponent, LineComponent, TableComponent],
  exports: [
    Kypo2TrainingsVisualizationOverviewLibComponent,
    TimelineComponent,
    ClusteringComponent
  ],
  providers: [D3Service]
})
export class Kypo2TrainingsVisualizationOverviewLibModule { }
