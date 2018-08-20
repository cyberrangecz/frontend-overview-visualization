/**
 * Raw event data
 */
export interface Event {
  playerId: string;
  timestamp: string; // Real time timestmap
  gametime: number; // Time spent on task
  event: string; // Event message / Type
  level?: number; // For visualization purpose
}
