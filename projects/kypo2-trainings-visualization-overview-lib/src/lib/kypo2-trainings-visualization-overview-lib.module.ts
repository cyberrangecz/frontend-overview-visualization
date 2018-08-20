import { NgModule } from '@angular/core';
import { Kypo2TrainingsVisualizationOverviewLibComponent } from './kypo2-trainings-visualization-overview-lib.component';
import { D3Service } from 'd3-ng2-service';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ClusteringComponent } from './components/clustering/clustering.component';

@NgModule({
  imports: [
  ],
  declarations: [Kypo2TrainingsVisualizationOverviewLibComponent, TimelineComponent, ClusteringComponent],
  exports: [
    Kypo2TrainingsVisualizationOverviewLibComponent,
    TimelineComponent,
    ClusteringComponent
  ],
  providers: [D3Service]
})
export class Kypo2TrainingsVisualizationOverviewLibModule { }
