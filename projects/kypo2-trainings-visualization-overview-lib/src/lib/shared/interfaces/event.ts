/**
 * Raw event data
 */
export interface Event {
  // prefix: string; // = 'cz.muni.csirt.kypo.events.trainings.';
  playerId: string;
  timestamp: string; // Real time timestmap
  gametime: number; // Time spent on task
  event: string; // Event message / Type
  actualScore?: number;
  level?: number; // For visualization purpose
}
