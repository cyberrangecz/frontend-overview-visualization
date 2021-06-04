import { PlayerDataDTO } from '../../dto/clustering/player-data-dto';
import { PlayerData } from '../../../model/clustering/player-data';

/**
 * @dynamic
 */
export class PlayerDataMapper {
  static fromDTOs(dtos: PlayerDataDTO[], activePlayerId: number): PlayerData[] {
    return dtos.map((dto) => PlayerDataMapper.fromDTO(dto, activePlayerId));
  }

  private static fromDTO(dto: PlayerDataDTO, activePlayerId: number): PlayerData {
    const player = new PlayerData();
    player.id = dto.id;
    player.name = player.id === activePlayerId ? 'you' : 'other player';
    player.picture = dto.picture;
    player.avatarColor = dto.avatar_color;
    player.trainingRunId = dto.training_run_id;
    player.trainingTime = dto.training_time / 1000;
    player.gameScore = dto.game_score;
    player.assessmentScore = dto.assessment_score;
    player.finished = dto.finished;
    return player;
  }
}
