import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { TimelineComponent } from './components/agenda/timeline/timeline.component';
import { ClusteringComponent } from './components/agenda/clustering/clustering.component';
import { FinalComponent } from './components/agenda/clustering/final/final.component';
import { LevelsComponent } from './components/agenda/clustering/levels/levels.component';
import { LineComponent } from './components/agenda/timeline/line/line.component';
import { TableComponent } from './components/agenda/table/table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltersComponent } from './components/agenda/filters/filters.component';
import { VisualizationOverviewConfig } from './config/kypo2-trainings-visualization-overview-lib';
import { ConfigService } from './config/config.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkColumnDef, CdkHeaderCellDef } from '@angular/cdk/table';
import { D3Service } from '@muni-kypo-crp/d3-service';
import { ClusteringService } from './components/agenda/clustering/shared/service/clustering.service';
import { ClusteringApiService } from './components/api/clustering/clustering-api.service';
import { TableDataService } from './components/agenda/table/service/table-data.service';
import { TableApiService } from './components/api/table/table-api.service';
import { TimelineService } from './components/agenda/timeline/service/timeline.service';
import { TimelineApiService } from './components/api/timeline/timeline-api.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    TimelineComponent,
    ClusteringComponent,
    FinalComponent,
    LevelsComponent,
    LineComponent,
    TableComponent,
    FiltersComponent,
  ],
  exports: [
    TimelineComponent,
    ClusteringComponent,
    TableComponent,
    FiltersComponent,
    FinalComponent,
    LevelsComponent,
    LineComponent,
  ],
  providers: [
    D3Service,
    ConfigService,
    CdkColumnDef,
    CdkHeaderCellDef,
    ClusteringService,
    ClusteringApiService,
    TableDataService,
    TableApiService,
    TimelineService,
    TimelineApiService,
  ],
})
export class Kypo2TrainingsVisualizationOverviewLibModule {
  constructor(@Optional() @SkipSelf() parentModule: Kypo2TrainingsVisualizationOverviewLibModule) {
    if (parentModule) {
      throw new Error(
        'Kypo2TrainingsVisualizationOverviewLibModule is already loaded. Import it in the main module only'
      );
    }
  }

  static forRoot(
    config: VisualizationOverviewConfig
  ): ModuleWithProviders<Kypo2TrainingsVisualizationOverviewLibModule> {
    return {
      ngModule: Kypo2TrainingsVisualizationOverviewLibModule,
      providers: [{ provide: VisualizationOverviewConfig, useValue: config }],
    };
  }
}
