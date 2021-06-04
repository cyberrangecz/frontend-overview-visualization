import { TimelineEvent } from './timeline-event';

export abstract class TimelineLevel {
  id: number;
  order: number;
  levelType: BasicLevelInfo.TimelineLevelTypeEnum;
  events: TimelineEvent[];
  startTime: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BasicLevelInfo {
  export type TimelineLevelTypeEnum = 'ASSESSMENT_LEVEL' | 'INFO_LEVEL' | 'GAME_LEVEL';
  export const TimelineLevelTypeEnum = {
    ASSESSMENT: 'ASSESSMENT_LEVEL' as TimelineLevelTypeEnum,
    INFO: 'INFO_LEVEL' as TimelineLevelTypeEnum,
    GAME: 'GAME_LEVEL' as TimelineLevelTypeEnum,
  };
}

export namespace BasicAssessmentInfo {
  export type AssessmentTypeEnum = 'TEST_ASSESSMENT';
  export const AssessmentTypeEnum = {
    TEST: 'TEST_ASSESSMENT' as AssessmentTypeEnum,
  };
}
