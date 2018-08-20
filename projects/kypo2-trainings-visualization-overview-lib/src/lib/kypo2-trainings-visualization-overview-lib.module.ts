import { NgModule } from '@angular/core';
import { Kypo2TrainingsVisualizationOverviewLibComponent } from './kypo2-trainings-visualization-overview-lib.component';
import { D3Service } from 'd3-ng2-service';

@NgModule({
  imports: [
  ],
  declarations: [Kypo2TrainingsVisualizationOverviewLibComponent],
  exports: [Kypo2TrainingsVisualizationOverviewLibComponent],
  providers: [D3Service]
})
export class Kypo2TrainingsVisualizationOverviewLibModule { }
