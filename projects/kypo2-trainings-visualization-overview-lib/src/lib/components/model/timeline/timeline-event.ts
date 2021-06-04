import { BasicLevelInfo } from './timeline-level';

export class TimelineEvent {
  text: string;
  time: number;
  score: number;
  levelType?: BasicLevelInfo.TimelineLevelTypeEnum;
  scoreChange?: number;
  levelOrder?: number;
  type?: BasicEventInfo.TimelineEventTypeEnum;
}

export namespace BasicEventInfo {
  export type TimelineEventTypeEnum =
    | 'CORRECT_FLAG_EVENT'
    | 'ASSESSMENT_EVENTS'
    | 'HINT_TAKEN_EVENT'
    | 'WRONG_FLAG_EVENT'
    | 'NON_GAME_EVENTS'
    | 'BASE_EVENTS';
  export const TimelineEventTypeEnum = {
    CORRECT_FLAG: 'CORRECT_FLAG_EVENT' as TimelineEventTypeEnum,
    ASSESSMENT_EVENTS: 'ASSESSMENT_EVENTS' as TimelineEventTypeEnum,
    HINT_TAKEN: 'HINT_TAKEN_EVENT' as TimelineEventTypeEnum,
    WRONG_FLAG: 'WRONG_FLAG_EVENT' as TimelineEventTypeEnum,
    NON_GAME: 'NON_GAME_EVENTS' as TimelineEventTypeEnum,
    BASE_EVENTS: 'BASE_EVENTS' as TimelineEventTypeEnum,
  };
}
