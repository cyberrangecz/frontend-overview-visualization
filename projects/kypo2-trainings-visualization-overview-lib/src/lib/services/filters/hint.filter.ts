import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'HINT';
};

export const hintFilter = {
    name: 'hintFilter',
    labelName: 'Hints taken',
    checked: false,
    filterFunction: filterFunction
};