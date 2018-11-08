import { PlayerVisualizationData } from './player-visualization-data';

export interface ClusteringFinalEventService {
    clusteringFinalOnPlayerMouseover(player: PlayerVisualizationData): void;
    clusteringFinalOnPlayerMousemove(player: PlayerVisualizationData): void;
    clusteringFinalOnPlayerMouseout(player: PlayerVisualizationData): void;
    clusteringFinalOnPlayerClick(player: PlayerVisualizationData): void;
}
