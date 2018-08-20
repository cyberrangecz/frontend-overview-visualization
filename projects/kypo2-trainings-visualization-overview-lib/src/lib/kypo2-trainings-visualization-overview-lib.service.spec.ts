import { TestBed, inject } from '@angular/core/testing';

import { Kypo2TrainingsVisualizationOverviewLibService } from './kypo2-trainings-visualization-overview-lib.service';

describe('Kypo2TrainingsVisualizationOverviewLibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Kypo2TrainingsVisualizationOverviewLibService]
    });
  });

  it('should be created', inject([Kypo2TrainingsVisualizationOverviewLibService], (service: Kypo2TrainingsVisualizationOverviewLibService) => {
    expect(service).toBeTruthy();
  }));
});
