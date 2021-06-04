import { PlayerTableDataDTO } from '../../dto/table/player-table-data-dto';
import { PlayerTableData } from '../../../model/table/player-table-data';
import { LevelTableDataMapper } from './level-table-data-mapper';

/**
 * @dynamic
 */
export class PlayerTableDataMapper {
  static fromDTOs(dtos: PlayerTableDataDTO[], anonymize: boolean, activePlayedId: number): PlayerTableData[] {
    return dtos.map((dto) => PlayerTableDataMapper.fromDTO(dto, anonymize, activePlayedId));
  }

  private static fromDTO(dto: PlayerTableDataDTO, anonymize: boolean, activePlayerId: number): PlayerTableData {
    const player: PlayerTableData = new PlayerTableData();
    player.id = dto.id;
    player.name = anonymize ? PlayerTableDataMapper.anonymizePlayers(dto.id, activePlayerId) : dto.name;
    player.picture = dto.picture;
    player.avatarColor = dto.avatar_color;
    player.trainingRunId = dto.training_run_id;
    player.trainingTime = dto.training_time / 1000;
    player.assessmentScore = dto.assessment_score;
    player.finished = dto.finished;
    player.levels = LevelTableDataMapper.fromDTOs(dto.levels);
    player.totalScore = dto.assessment_score + dto.game_score;
    player.checked = false;

    return player;
  }

  static anonymizePlayers(playerId: number, activePlayerId: number): string {
    return playerId === activePlayerId ? 'you' : 'other player';
  }
}
