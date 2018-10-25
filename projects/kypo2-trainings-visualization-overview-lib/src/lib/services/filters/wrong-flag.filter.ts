import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'WRONG';
};

export const wrongFlagFilter = {
    name: 'wrongFlagFilter',
    labelName: 'Wrong flags',
    checked: false,
    filterFunction: filterFunction
};