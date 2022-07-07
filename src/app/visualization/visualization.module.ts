import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {VisualizationOverviewComponent} from './visualization-overview.component';
import {VisualizationRoutingModule} from './visualization-routing.module';
import {CustomConfig} from '../custom-config';
import {KypoTrainingsVisualizationOverviewLibModule} from '../../../projects/kypo-trainings-visualization-overview-lib/src/public_api';

@NgModule({
  declarations: [
    VisualizationOverviewComponent
  ],
  imports: [
    CommonModule,
    VisualizationRoutingModule,
    KypoTrainingsVisualizationOverviewLibModule.forRoot(CustomConfig),
    KypoTrainingsVisualizationOverviewLibModule
  ],
  exports: [
    VisualizationOverviewComponent
  ]
})
export class VisualizationModule {
}
