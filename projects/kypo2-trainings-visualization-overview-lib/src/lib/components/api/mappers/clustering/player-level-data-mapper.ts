import { PlayerLevelDataDTO } from '../../dto/clustering/player-level-data-dto';
import { PlayerLevelData } from '../../../model/clustering/player-level-data';

/**
 * @dynamic
 */
export class PlayerLevelDataMapper {
  static fromDTOs(dtos: PlayerLevelDataDTO[], activePlayerId: number): PlayerLevelData[] {
    return dtos.map((dto) => PlayerLevelDataMapper.fromDTO(dto, activePlayerId));
  }

  private static fromDTO(dto: PlayerLevelDataDTO, activePlayerId: number): PlayerLevelData {
    const player = new PlayerLevelData();
    player.id = dto.id;
    player.name = player.id === activePlayerId ? 'you' : 'other player';
    player.picture = dto.picture;
    player.avatarColor = dto.avatar_color;
    player.trainingRunId = dto.training_run_id;
    player.trainingTime = dto.training_time / 1000;
    player.participantLevelScore = dto.participant_level_score;
    player.finished = dto.finished;
    return player;
  }
}
