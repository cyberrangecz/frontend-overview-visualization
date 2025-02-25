import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VisualizationOverviewComponent } from './visualization-overview.component';
import { VisualizationRoutingModule } from './visualization-routing.module';
import { CustomConfig } from '../custom-config';
import {
    TrainingsVisualizationsOverviewLibModule
} from '../../../projects/overview-visualization/src/public_api';

@NgModule({
    declarations: [
        VisualizationOverviewComponent
    ],
    imports: [
        CommonModule,
        VisualizationRoutingModule,
        TrainingsVisualizationsOverviewLibModule.forRoot(CustomConfig),
        TrainingsVisualizationsOverviewLibModule
    ],
    exports: [
        VisualizationOverviewComponent
    ]
})
export class VisualizationModule {
}
