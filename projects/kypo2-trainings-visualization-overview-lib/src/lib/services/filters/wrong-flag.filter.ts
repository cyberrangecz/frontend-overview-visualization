import { ScoredEvent } from '../../components/timeline/interfaces/scored-event';
import {GenericEvent} from '../../shared/interfaces/generic-event.enum';

const filterFunction = function(event: ScoredEvent) {
    return event.event !== GenericEvent.TypePrefix + GenericEvent.WrongFlag;
};

export const wrongFlagFilter = {
    name: 'wrongFlagFilter',
    labelName: 'Wrong flags',
    checked: false,
    filterFunction: filterFunction
}
