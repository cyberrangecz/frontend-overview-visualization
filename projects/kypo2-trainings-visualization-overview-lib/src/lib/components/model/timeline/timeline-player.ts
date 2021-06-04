import { TimelineLevel } from './timeline-level';

export class TimelinePlayer {
  id: number;
  name: string;
  picture: string;
  avatarColor: string;
  trainingRunId: number;
  trainingTime: number;
  gameScore: number;
  assessmentScore: number;
  levels: TimelineLevel[];
  checked?: boolean;
}
