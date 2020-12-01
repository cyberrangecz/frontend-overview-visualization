import { PlayerService } from './services/player.service';
import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
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
import { VisualizationOverviewConfig } from './config/kypo2-trainings-visualization-overview-lib';
import {ConfigService} from './config/config.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CdkColumnDef, CdkHeaderCellDef} from '@angular/cdk/table';
import {D3Service} from '@kypo/d3-service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
    MatTooltipModule
  ],
  declarations: [
    TimelineComponent,
    ClusteringComponent,
    FinalComponent,
    LevelsComponent,
    LineComponent,
    TableComponent,
    FiltersComponent
  ],
  exports: [
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
    CdkHeaderCellDef,
    PlayerService
  ]
})
export class Kypo2TrainingsVisualizationOverviewLibModule {
  constructor(@Optional() @SkipSelf() parentModule: Kypo2TrainingsVisualizationOverviewLibModule) {
    if (parentModule) {
      throw new Error(
        'Kypo2TrainingsVisualizationOverviewLibModule is already loaded. Import it in the main module only');
    }
  }

  static forRoot(config: VisualizationOverviewConfig): ModuleWithProviders<Kypo2TrainingsVisualizationOverviewLibModule> {
    return {
      ngModule: Kypo2TrainingsVisualizationOverviewLibModule,
      providers: [
        {provide: VisualizationOverviewConfig, useValue: config}
      ]
    };
  }
}
