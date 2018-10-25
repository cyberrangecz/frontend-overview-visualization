import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'LEVEL';
};

export const skipFilter = {
    name: 'skipFilter',
    labelName: 'Levels skipped',
    checked: false,
    filterFunction: filterFunction
};