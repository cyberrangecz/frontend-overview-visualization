import { BasicLevelInfoDTO, LevelDTO } from '../../dto/clustering/level-dto';
import { Level } from '../../../model/clustering/level';
import { LevelTypeEnum } from '../../../model/clustering/enums/level-type.enum';
import { PlayerLevelDataMapper } from './player-level-data-mapper';

/**
 * @dynamic
 */
export class LevelMapper {
  static fromDTOs(dtos: LevelDTO[], activePlayerId: number): Level[] {
    return dtos.map((dto) => LevelMapper.fromDTO(dto, activePlayerId));
  }

  private static fromDTO(dto: LevelDTO, activePlayerId: number): Level {
    const level: Level = new Level();
    level.id = dto.id;
    level.title = dto.title;
    level.order = dto.order;
    level.averageScore = dto.average_score;
    level.maxParticipantScore = dto.max_participant_score;
    level.estimatedTime = dto.estimated_time / 1000;
    level.averageTime = dto.average_time / 1000;
    level.maxParticipantTime = dto.max_participant_time / 1000;
    level.levelType = LevelMapper.levelTypeFromDTO(dto.level_type);
    level.playerLevelData = PlayerLevelDataMapper.fromDTOs(dto.player_data, activePlayerId);

    return level;
  }

  private static levelTypeFromDTO(levelTypeDTO: BasicLevelInfoDTO.LevelTypeEnum): LevelTypeEnum {
    switch (levelTypeDTO) {
      case BasicLevelInfoDTO.LevelTypeEnum.ASSESSMENT:
        return LevelTypeEnum.AssessmentLevel;
      case BasicLevelInfoDTO.LevelTypeEnum.GAME:
        return LevelTypeEnum.GameLevel;
      case BasicLevelInfoDTO.LevelTypeEnum.INFO:
        return LevelTypeEnum.InfoLevel;
      default: {
        console.error(
          `Attribute "level_type" of ClusteringVisualizationResourceDTO with value: ${levelTypeDTO} does not match any of the Level types`
        );
        return undefined;
      }
    }
  }
}
