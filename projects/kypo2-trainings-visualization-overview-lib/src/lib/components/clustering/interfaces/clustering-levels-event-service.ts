import { PlayerVisualizationData } from './player-visualization-data';
import { LevelsComponent } from '../levels/levels.component';

export interface ClusteringLevelsEventService {

    clusteringLevelsComponent: LevelsComponent;

    clusteringLevelsOnPlayerMouseover(player: PlayerVisualizationData): void;

    clusteringLevelsOnPlayerMousemove(player: PlayerVisualizationData): void;

    clusteringLevelsOnPlayerMouseout(player: PlayerVisualizationData): void;

    clusteringLevelsOnPlayerClick(player: PlayerVisualizationData): void;

    registerClusteringLevelsComponent(component: LevelsComponent): void;
}
