import { ScoredEvent } from '../../interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'HINT';
};

export const hintFilter = {
    name: 'hintFilter',
    checked: false,
    filterFunction: filterFunction
};