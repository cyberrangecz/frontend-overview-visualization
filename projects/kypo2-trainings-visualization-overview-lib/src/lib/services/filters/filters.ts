import { hintFilter } from './hint.filter';
import { correctFlagFilter } from './correct-flag.filter';
import { wrongFlagFilter } from './wrong-flag.filter';
import { basicfilter } from './basicfilter';
import { gameLevelFilter } from './game-level.filter';
import { assessmentLevelFilter } from './assessment-level.filter';
import { infoLevelFilter } from './info-level.filter';

// Add every new filter to this array
export const FILTERS_ARRAY = [
  correctFlagFilter,
  hintFilter,
  wrongFlagFilter,
  gameLevelFilter,
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
