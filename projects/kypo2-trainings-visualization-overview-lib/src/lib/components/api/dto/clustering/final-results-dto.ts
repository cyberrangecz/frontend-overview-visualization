import { PlayerDataDTO } from './player-data-dto';

export class FinalResultsDTO {
  estimated_time: number;
  max_participant_score: number;
  max_participant_game_score: number;
  max_participant_assessment_score: number;
  max_participant_time: number;
  average_time: number;
  average_score: number;
  average_game_score: number;
  average_assessment_score: number;
  player_data: PlayerDataDTO[];
}
