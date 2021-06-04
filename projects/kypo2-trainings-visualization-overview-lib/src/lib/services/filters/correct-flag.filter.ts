import { BasicEventInfo, TimelineEvent } from '../../components/model/timeline/timeline-event';

const filterFunction = function (event: TimelineEvent) {
  return event.type === BasicEventInfo.TimelineEventTypeEnum.CORRECT_FLAG;
};

export const correctFlagFilter = {
  name: 'correctFlagFilter',
  labelName: 'Correct flags / finished levels',
  checked: true,
  filterFunction: filterFunction,
};
