import { BasicEventInfo, TimelineEvent } from '../../components/model/timeline/timeline-event';
import { BasicLevelInfo } from '../../components/model/timeline/timeline-level';

const filterFunction = function (event: TimelineEvent) {
  return (
    event.levelType === BasicLevelInfo.TimelineLevelTypeEnum.GAME &&
    event.type !== BasicEventInfo.TimelineEventTypeEnum.HINT_TAKEN &&
    event.type !== BasicEventInfo.TimelineEventTypeEnum.WRONG_FLAG
  );
};

export const gameLevelFilter = {
  name: 'gameLevelFilter',
  labelName: 'Game level',
  checked: true,
  filterFunction: filterFunction,
};
