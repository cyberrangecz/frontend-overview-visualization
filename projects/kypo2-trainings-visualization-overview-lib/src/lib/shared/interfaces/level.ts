import { Hint } from './hint';

/**
 * Raw information about level in information.
 */
export interface Level {
  type: string; // type of level (game/assessment/info)
  id: number;
  number: number; // Level's number
  name: string; // Level's name
  estimatedTime: number; // Level's estimated time of solving
  points: number; // Level's max achievable score
  gameLevelNumber?: number; // number, used only for game levels
  hints?: Hint[]; // Array of provided hints
  questions?: string[]; // Array of string questions for assessment - is it needed here?
}
