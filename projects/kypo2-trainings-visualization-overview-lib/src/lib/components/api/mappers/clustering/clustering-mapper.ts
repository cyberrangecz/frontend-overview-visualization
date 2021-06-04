import { ClusteringVisualizationResourceDTO } from '../../dto/clustering/clustering-visualization-resource-dto';
import { ClusteringGameData } from '../../../model/clustering/clustering-game-data';
import { LevelMapper } from './level-mapper';
import { FinalResults } from '../../../model/clustering/final-results';
import { PlayerDataMapper } from './player-data-mapper';

export class ClusteringMapper {
  static fromDTO(dto: ClusteringVisualizationResourceDTO, activePlayerId: number): ClusteringGameData {
    const result = new ClusteringGameData();

    result.finalResults = new FinalResults();
    result.finalResults.maxParticipantAssessmentScore = dto.final_results.max_participant_assessment_score;
    result.finalResults.maxParticipantGameScore = dto.final_results.max_participant_game_score;
    result.finalResults.maxParticipantScore = dto.final_results.max_participant_score;
    result.finalResults.averageScore = dto.final_results.average_score;
    result.finalResults.maxParticipantTime = dto.final_results.max_participant_time / 1000;
    result.finalResults.averageTime = dto.final_results.average_time / 1000;
    result.finalResults.estimatedTime = dto.final_results.estimated_time / 1000;
    result.finalResults.playerData = PlayerDataMapper.fromDTOs(dto.final_results.player_data, activePlayerId);
    result.levels = LevelMapper.fromDTOs(dto.levels, activePlayerId);

    return result;
  }
}
