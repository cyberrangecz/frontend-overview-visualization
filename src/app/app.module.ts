import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Kypo2TrainingsVisualizationOverviewLibModule } from 'projects/kypo2-trainings-visualization-overview-lib/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Kypo2TrainingsVisualizationOverviewLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
