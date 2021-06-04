import { TimelineEvent } from '../../components/model/timeline/timeline-event';
import { BasicLevelInfo } from '../../components/model/timeline/timeline-level';

const filterFunction = function (event: TimelineEvent) {
  return event.levelType === BasicLevelInfo.TimelineLevelTypeEnum.GAME;
};

export const gameLevelFilter = {
  name: 'gameLevelFilter',
  labelName: 'Game level',
  checked: true,
  filterFunction: filterFunction,
};
