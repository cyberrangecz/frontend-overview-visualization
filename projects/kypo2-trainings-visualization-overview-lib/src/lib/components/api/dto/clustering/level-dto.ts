import { PlayerLevelDataDTO } from './player-level-data-dto';

export class LevelDTO {
  id: number;
  order: number;
  level_type: BasicLevelInfoDTO.LevelTypeEnum;
  title: string;
  estimated_time: number;
  max_participant_score: number;
  max_participant_time: number;
  average_time: number;
  average_score: number;
  player_data: PlayerLevelDataDTO[];
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BasicLevelInfoDTO {
  export type LevelTypeEnum = 'ASSESSMENT_LEVEL' | 'INFO_LEVEL' | 'GAME_LEVEL';
  export const LevelTypeEnum = {
    ASSESSMENT: 'ASSESSMENT_LEVEL' as LevelTypeEnum,
    INFO: 'INFO_LEVEL' as LevelTypeEnum,
    GAME: 'GAME_LEVEL' as LevelTypeEnum,
  };
}
