import { hintFilter } from './hint.filter';
import { correctAnswerFilter } from './correct-answer.filter';
import {wrongAnswerFilter} from './wrong-answer.filter';
import { basicfilter } from './basicfilter';
import { trainingLevelFilter } from './training-level.filter';
import { assessmentLevelFilter } from './assessment-level.filter';
import { infoLevelFilter } from './info-level.filter';

// Add every new filter to this array
export const FILTERS_ARRAY = [
  correctAnswerFilter,
  hintFilter,
  wrongAnswerFilter,
  trainingLevelFilter,
  assessmentLevelFilter,
  infoLevelFilter,
  basicfilter,
];

export const FILTERS_OBJECT = getFiltersObject(FILTERS_ARRAY);

function getFiltersObject(filtersArray) {
  const resultObject = {};
  filtersArray.forEach((filter) => {
    Object.defineProperty(resultObject, filter.name, {
      value: filter,
      writable: false,
      enumerable: true,
    }); // allows using Object.keys on result object (needed in ScoreProgressComponent.filterEvents())
  });
  return resultObject;
}
