import { environment } from '../environments/environment';
import { VisualizationOverviewConfig } from '../../projects/overview-visualization/src/public_api';

export const CustomConfig: VisualizationOverviewConfig = {
    trainingServiceUrl: environment.trainingServiceUrl,
};
