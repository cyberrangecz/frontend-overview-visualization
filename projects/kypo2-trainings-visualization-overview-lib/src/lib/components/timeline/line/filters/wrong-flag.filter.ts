import { ScoredEvent } from '../../interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'WRONG';
};

export const wrongFlagFilter = {
    name: 'wrongFlagFilter',
    checked: false,
    filterFunction: filterFunction
};