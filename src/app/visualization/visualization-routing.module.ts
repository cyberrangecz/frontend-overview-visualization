import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {VisualizationOverviewComponent} from './visualization-overview.component';
import {MatTableModule} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import { CdkColumnDef } from '@angular/cdk/table';

const routes: Routes = [
  {
    path: '',
    component: VisualizationOverviewComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationRoutingModule {

}
