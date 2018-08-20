import { Event } from './event';

/**
 * Events in particular level.
 */
export interface LevelEvents {
  number: number; // Number of the level
  events: Event[]; // Array of events
}
