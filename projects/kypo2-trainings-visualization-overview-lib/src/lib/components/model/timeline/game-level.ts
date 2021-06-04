import { TimelineLevel } from './timeline-level';
import { TimelineEvent } from './timeline-event';

export class GameLevel extends TimelineLevel {
  score: number;
  solutionDisplayedTime: number;
  correctFlagTime: number;
  wrongFlagPenalty: number;

  constructor() {
    super();
  }
}
