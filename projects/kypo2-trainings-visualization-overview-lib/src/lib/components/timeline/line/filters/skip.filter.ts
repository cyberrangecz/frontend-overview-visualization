import { ScoredEvent } from '../../interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'LEVEL';
};

export const skipFilter = {
    name: 'skipFilter',
    checked: false,
    filterFunction: filterFunction
};