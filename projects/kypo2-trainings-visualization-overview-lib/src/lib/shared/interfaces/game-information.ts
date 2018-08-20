import {Level} from './level';

/**
 * Fetched game's information.
 */
export interface GameInformation {
  name: string; // Game's name
  levels: Level[]; // Game's list of levels
  estimatedTime: number; // Estimated time of playing
}
