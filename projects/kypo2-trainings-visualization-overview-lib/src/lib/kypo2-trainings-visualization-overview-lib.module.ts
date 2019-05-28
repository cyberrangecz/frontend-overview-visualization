import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
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
import { FiltersComponent } from './components/filters/filters.component';
import { Kypo2TrainingsVisualizationOverviewLibConfig } from './config/kypo2-trainings-visualization-overview-lib';
import {ConfigService} from './config/config.service';
import {MatTableModule} from '@angular/material';
import {CdkColumnDef, CdkHeaderCellDef, CdkHeaderRowDef, CdkRowDef} from '@angular/cdk/table';

@NgModule({
  imports: [CommonModule, FormsModule, MatTableModule],
  declarations: [
    Kypo2TrainingsVisualizationOverviewLibComponent,
    TimelineComponent,
    ClusteringComponent,
    FinalComponent,
    LevelsComponent,
    LineComponent,
    TableComponent,
    FiltersComponent
  ],
  exports: [
    Kypo2TrainingsVisualizationOverviewLibComponent,
    TimelineComponent,
    ClusteringComponent,
    TableComponent,
    FiltersComponent,
    FinalComponent,
    LevelsComponent,
    LineComponent
  ],
  providers: [
    D3Service,
    DataProcessor,
    DataService,
    ScoreService,
    TimeService,
    ConfigService,
    CdkColumnDef,
    CdkHeaderCellDef
  ]
})
export class Kypo2TrainingsVisualizationOverviewLibModule {
  constructor(@Optional() @SkipSelf() parentModule: Kypo2TrainingsVisualizationOverviewLibModule) {
    if (parentModule) {
      throw new Error(
        'Kypo2TrainingsVisualizationOverviewLibModule is already loaded. Import it in the main module only');
    }
  }

  static forRoot(config: Kypo2TrainingsVisualizationOverviewLibConfig): ModuleWithProviders {
    return {
      ngModule: Kypo2TrainingsVisualizationOverviewLibModule,
      providers: [
        {provide: Kypo2TrainingsVisualizationOverviewLibConfig, useValue: config}
      ]
    };
  }
}
