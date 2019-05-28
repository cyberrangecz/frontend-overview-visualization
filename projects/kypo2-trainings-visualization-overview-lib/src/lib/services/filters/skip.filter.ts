import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

/**
 * Are skips obsolete? Used for filtering of non-game levels instead
 * @param event
 */
const filterFunction = function(event: ScoredEvent) {
  return event.type === 'GAME';
    // return event.event.toUpperCase().split(' ')[0] !== 'LEVEL';
};

export const skipFilter = {
    name: 'skipFilter',
    labelName: 'Non-game Levels',
    checked: false,
    filterFunction: filterFunction
};
