import { BasicEventInfo, TimelineEvent } from '../../components/model/timeline/timeline-event';

const filterFunction = function (event: TimelineEvent) {
  return event.type === BasicEventInfo.TimelineEventTypeEnum.WRONG_FLAG;
};

export const wrongFlagFilter = {
  name: 'wrongFlagFilter',
  labelName: 'Wrong flags',
  checked: false,
  filterFunction: filterFunction,
};
