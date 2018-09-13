import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';

const filterFunction = function(event: ScoredEvent) {
    return event.event.toUpperCase().split(' ')[0] !== 'CORRECT';
};

export const correctFlagFilter = {
    name: 'correctFlagFilter',
    checked: true,
    filterFunction: filterFunction
};