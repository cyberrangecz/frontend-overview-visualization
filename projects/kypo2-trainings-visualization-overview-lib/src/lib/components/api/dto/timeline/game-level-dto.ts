import { TimelineEventDTO } from './timeline-event-dto';
import { TimelineLevelDataDTO } from './timeline-level-data-dto';

export interface GameLevelDTO extends TimelineLevelDataDTO {
  score: number;
  solution_displayed_time: number;
  correct_flag_time: number;
  wrong_flag_penalty: number;
  events: TimelineEventDTO[];
}
