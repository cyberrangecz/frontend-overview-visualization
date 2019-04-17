import {ScoredEvent} from '../../components/timeline/interfaces/scored-event';
import {GenericEvent} from '../../shared/interfaces/generic-event.enum';

const filterFunction = function(event: ScoredEvent) {
    return event.event !== GenericEvent.TypePrefix + GenericEvent.HintTaken;
};

export const hintFilter = {
    name: 'hintFilter',
    labelName: 'Hints taken',
    checked: false,
    filterFunction: filterFunction
};
