import { GameInformation } from './game-information';
import { GameEvents } from './game-events';

/**
 * Object holding information and events to be passed to visualizations.
 */
export interface GameData {
    information: GameInformation;
    events: GameEvents;
}