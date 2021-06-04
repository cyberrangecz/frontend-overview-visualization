import { GameLevelDTO } from '../../dto/timeline/game-level-dto';
import { GameLevel } from '../../../model/timeline/game-level';

export class GameLevelMapper {
  static fromDTO(dto: GameLevelDTO): GameLevel {
    const level = new GameLevel();
    level.score = dto.score;
    level.solutionDisplayedTime = dto.solution_displayed_time / 1000;
    level.correctFlagTime = dto.correct_flag_time / 1000;
    return level;
  }
}
