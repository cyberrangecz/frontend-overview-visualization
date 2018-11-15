import { PlayerVisualizationData } from './player-visualization-data';
import { FinalComponent } from '../final/final.component';

export interface ClusteringFinalEventService {

    clusteringFinalComponent: FinalComponent;

    clusteringFinalOnPlayerMouseover(player: PlayerVisualizationData): void;

    clusteringFinalOnPlayerMousemove(player: PlayerVisualizationData): void;

    clusteringFinalOnPlayerMouseout(player: PlayerVisualizationData): void;

    clusteringFinalOnPlayerClick(player: PlayerVisualizationData): void;

    registerClusteringFinalComponent(component: FinalComponent): void;
}
