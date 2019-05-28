import {Injectable} from '@angular/core';
import {Kypo2TrainingsVisualizationOverviewLibConfig} from './kypo2-trainings-visualization-overview-lib';

@Injectable()
export class ConfigService {

  private readonly _config: Kypo2TrainingsVisualizationOverviewLibConfig;
  private _trainingInstanceId: number;
  private _trainingDefinitionId: number;

  get trainingInstanceId(): number {
    return this._trainingInstanceId;
  }

  get trainingDefinitionId(): number {
    return this._trainingDefinitionId;
  }

  set trainingInstanceId(value: number) {
    this._trainingInstanceId = value;
  }
  set trainingDefinitionId(value: number) {
    this._trainingDefinitionId = value;
  }

  get config(): Kypo2TrainingsVisualizationOverviewLibConfig {
    return this._config;
  }

  constructor(config: Kypo2TrainingsVisualizationOverviewLibConfig) {
    this._config = config;
  }
}
