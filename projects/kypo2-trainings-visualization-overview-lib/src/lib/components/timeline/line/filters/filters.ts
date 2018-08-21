import { hintFilter } from "./hint.filter";
import { correctFlagFilter } from './correct-flag.filter';
import { wrongFlagFilter } from './wrong-flag.filter';
import { skipFilter } from './skip.filter';

// Add every new filter to this array
export const FILTERS_ARRAY = [
    hintFilter, 
    correctFlagFilter, 
    wrongFlagFilter, 
    skipFilter
];

export const FILTERS_OBJECT = getFiltersObject(FILTERS_ARRAY);

function getFiltersObject(filtersArray) {
    let resultObject = {};
    filtersArray.forEach(filter => {
        Object.defineProperty(resultObject, filter.name, {
            value: filter, 
            writable: false, 
            enumerable: true}); //allows using Object.keys on result object (needed in ScoreProgressComponent.filterEvents())
    });
    return resultObject;
}