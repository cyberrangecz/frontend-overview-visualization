import { Hint } from './hint';

/**
 * Raw information about level in information.
 */
export interface Level {
  number: number; // Level's number
  name: string; // Level's name
  estimatedTime: number; // Level's estimated time of solving
  points: number; // Level's max achievable score
  hints: Hint[]; // Array of provided hints
}
