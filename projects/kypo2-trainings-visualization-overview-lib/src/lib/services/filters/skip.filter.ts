import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

/**
 * Obsolete skips? Used for non-gema levels instead
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
