import { PlayerData } from './player-data';

export class FinalResults {
  estimatedTime: number;
  maxParticipantScore: number;
  maxParticipantTrainingScore: number;
  maxParticipantAssessmentScore: number;
  maxParticipantTime: number;
  averageTime: number;
  averageScore: number;
  averageTrainingScore: number;
  averageAssessmentScore: number;
  playerData: PlayerData[];
}
