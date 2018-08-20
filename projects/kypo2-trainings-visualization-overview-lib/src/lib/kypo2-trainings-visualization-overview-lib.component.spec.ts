import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Kypo2TrainingsVisualizationOverviewLibComponent } from './kypo2-trainings-visualization-overview-lib.component';

describe('Kypo2TrainingsVisualizationOverviewLibComponent', () => {
  let component: Kypo2TrainingsVisualizationOverviewLibComponent;
  let fixture: ComponentFixture<Kypo2TrainingsVisualizationOverviewLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Kypo2TrainingsVisualizationOverviewLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Kypo2TrainingsVisualizationOverviewLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
