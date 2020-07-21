import {environment} from '../environments/environment';
import {VisualizationOverviewConfig} from '../../projects/kypo2-trainings-visualization-overview-lib/src/public_api';

export const CustomConfig: VisualizationOverviewConfig = {
  trainingServiceUrl: environment.trainingServiceUrl,
  elasticSearchServiceUrl: environment.elasticSearchServiceUrl
};
