import { TimelineQuestionDTO } from './timeline-question-dto';
import { TimelineEventDTO } from './timeline-event-dto';

export interface TimelineLevelDataDTO {
  id: number;
  order: number;
  level_type: BasicLevelInfoDTO.TimelineLevelTypeEnum;
  start_time: number;
  participant_level_score: number;
  solution_displayed_time?: number;
  correct_flag_time?: number;
  wrong_flag_penalty?: number;

  events: TimelineEventDTO[];

  assessment_type?: BasicAssessmentInfoDTO.AssessmentTypeEnum;
  questions?: TimelineQuestionDTO[];
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BasicLevelInfoDTO {
  export type TimelineLevelTypeEnum = 'ASSESSMENT_LEVEL' | 'INFO_LEVEL' | 'GAME_LEVEL';
  export const TimelineLevelTypeEnum = {
    ASSESSMENT: 'ASSESSMENT_LEVEL' as TimelineLevelTypeEnum,
    INFO: 'INFO_LEVEL' as TimelineLevelTypeEnum,
    GAME: 'GAME_LEVEL' as TimelineLevelTypeEnum,
  };
}

export namespace BasicAssessmentInfoDTO {
  export type AssessmentTypeEnum = 'TEST_ASSESSMENT';
  export const AssessmentTypeEnum = {
    TEST: 'TEST_ASSESSMENT' as AssessmentTypeEnum,
  };
}
