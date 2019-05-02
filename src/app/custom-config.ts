import {environment} from '../environments/environment';
import {Kypo2TrainingsVisualizationOverviewLibConfig} from '../../projects/kypo2-trainings-visualization-overview-lib/src/public_api';

export const CustomConfig: Kypo2TrainingsVisualizationOverviewLibConfig = {
  kypo2TrainingsVisualizationRestBasePath: environment.kypo2TrainingsVisualizationRestBasePath,
  defaultPaginationSize: environment.defaultPaginationSize
};
