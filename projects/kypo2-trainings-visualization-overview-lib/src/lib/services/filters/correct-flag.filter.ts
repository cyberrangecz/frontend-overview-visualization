import {ScoredEvent} from '../../components/timeline/interfaces/scored-event';
import {GenericEvent} from '../../shared/interfaces/generic-event.enum';

const filterFunction = function(event: ScoredEvent) {
    return (event.event !== GenericEvent.TypePrefix + GenericEvent.CorrectFlag &&
            event.event != GenericEvent.TypePrefix + GenericEvent.LevelCompleted);
};

export const correctFlagFilter = {
    name: 'correctFlagFilter',
    labelName: 'Correct flags / finished levels',
    checked: true,
    filterFunction: filterFunction
};
