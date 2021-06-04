import { PlayerData } from './player-data';

export class FinalResults {
  estimatedTime: number;
  maxParticipantScore: number;
  maxParticipantGameScore: number;
  maxParticipantAssessmentScore: number;
  maxParticipantTime: number;
  averageTime: number;
  averageScore: number;
  averageGameScore: number;
  averageAssessmentScore: number;
  playerData: PlayerData[];
}
