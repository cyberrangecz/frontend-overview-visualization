import { Event } from './event';

/**
 * Events in particular level.
 */
export interface LevelEvents {
  type: string; // type of level (game/assessment/info)
  id: number;
  number: number; // Number of the level
  events: Event[]; // Array of events
  gameLevelNumber?: number; // number, used only for game levels
}
