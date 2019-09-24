/**
 * Raw event data
 */

export interface Event {
  levelType: string;
  playerId: string;
  timestamp: number; // Real time timestmap
  gametime: number; // Time spent on task
  event: string; // Event message / Type
  actualScore?: number; // actual score in level?
  penalty?: number;
  totalScore?: number; // total achieved score so far
  level?: number; // For visualization purpose
  gameLevel?: number; // For visualization purpose, game levels only
}
