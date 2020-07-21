import {Injectable} from '@angular/core';
import {VisualizationOverviewConfig} from './kypo2-trainings-visualization-overview-lib';

@Injectable()
export class ConfigService {

  private readonly _config: VisualizationOverviewConfig;
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

  get config(): VisualizationOverviewConfig {
    return this._config;
  }

  constructor(config: VisualizationOverviewConfig) {
    this._config = config;
  }
}
