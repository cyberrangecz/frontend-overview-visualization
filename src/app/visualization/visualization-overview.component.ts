import { Component, OnInit } from '@angular/core';
import {CustomConfig} from '../custom-config';

@Component({
  selector: 'app-visualization-overview',
  templateUrl: './visualization-overview.component.html',
  styleUrls: ['./visualization-overview.component.css']
})
export class VisualizationOverviewComponent implements OnInit {

  public feedbackLearnerId: string = null; //for testing purposes we can define the current player login

  constructor() { }

  ngOnInit() {
  }

}
