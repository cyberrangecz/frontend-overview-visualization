import {Injectable} from '@angular/core';
import {GameEvents} from '../shared/interfaces/game-events';
import {D3, D3Service} from 'd3-ng2-service';
import {Event} from '../shared/interfaces/event';
import {Level} from '../shared/interfaces/level';
import {GameInformation} from '../shared/interfaces/game-information';
import {GenericEvent} from '../shared/interfaces/generic-event.enum';

@Injectable()
/**
 * Computes all necessary data concerning score (scoring system, max. score in game, etc.)
 */
export class ScoreService {

  private d3: D3;

  constructor(d3: D3Service) {
    this.d3 = d3.getD3();
  }

  getEachLevelScores(information: GameInformation, events: GameEvents, onlyGameLevels: boolean = true): {}[] {
    if (events == null || events.levels === null || information === null || information.levels === null) { return []; }
    const eachLevelScores = [];
    let levelGroup = {};
    let levelNumbers = 0;
    events.levels.forEach((level) => {
      if (onlyGameLevels && level.type !== 'GAME_LEVEL') {
        // console.log('skipping level ' + level.number);
      } else {
        const levelGroupedEvents = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
        const levelInfo = information.levels[levelNumbers++];
        levelGroupedEvents.forEach(player => {
          const actualScore = player.values[player.values.length - 1].actualScore;
          // backward compatibility loop:
          if (actualScore === undefined) {
            player.values.forEach((event, i) => {
              // Assign level's max points to player on first assignment to prevent adding up to undefined => NaN
              const isFirstAssignment: boolean = (i < 1);
              if (isFirstAssignment) {
                levelGroup[player.key] = levelInfo.points;
              }
              levelGroup[player.key] += this.getScore(levelInfo, event);
              const isNegative = levelGroup[player.key] < 0;
              if (isNegative) {
                levelGroup[player.key] = 0;
              } // If level skipped, help level accessed or exited prematurely
            });
          } else {
            levelGroup[player.key] = actualScore;
          }
        });
        eachLevelScores.push(levelGroup);
        levelGroup = {};
      }
    });
    return eachLevelScores;
  }

  /**
   * Count hints that player took in each level and return an array of objects {playerId : hintsTaken}
   * @param information
   * @param events
   */
  getEachLevelHintsTaken(information: GameInformation, events: GameEvents): {}[] {
    return this.getEachLevelEventCountByType(GenericEvent.TypePrefix + GenericEvent.HintTaken, information, events);
  }

    /**
   * Count wrong flags submitted in each level and return an array of objects {playerId : wrong flags submitted}
   * @param information
   * @param events
   */
  getEachLevelWrongFlags(information: GameInformation, events: GameEvents): {}[] {
    return this.getEachLevelEventCountByType(GenericEvent.TypePrefix + GenericEvent.WrongFlag, information, events);
  }

  getEachLevelEventCountByType(type: string, information: GameInformation, events: GameEvents, onlyGameLevels = true) {

    if (events === null) { return []; }
    const result: {}[] = [];
    const levels = events.levels;
    let playerWantedEventsInCurrentLevel = {};
    levels.forEach(level => {
      if (onlyGameLevels && level.type === 'GAME_LEVEL') {
        const playerEvents = this.d3.nest().key((event: Event) => event.playerId).entries(level.events);
        playerEvents.forEach(player => {
          const playerId = player.key;
          const playerValEvents = player.values;
          const isWantedType = (currentValue: Event) => currentValue.event === type;
          const eventCounterFunction = (accumulator, currentValue: Event) => isWantedType(currentValue) ? accumulator + 1 : accumulator;
          const eventCount = playerValEvents.reduce(eventCounterFunction, 0);
          playerWantedEventsInCurrentLevel[playerId] = eventCount;
        });
        result.push(playerWantedEventsInCurrentLevel);
        playerWantedEventsInCurrentLevel = {};
      }
    });
    return result;
  }

  getScore(level: Level, event: Event): number {
    switch (event.event) {
      case GenericEvent.TypePrefix + GenericEvent.CorrectFlag: // Correct flag submited
        return 0;
      case GenericEvent.TypePrefix + GenericEvent.HintTaken: // Hint # taken
        return -event.penalty; // this.getHintScore(level, event);
      case GenericEvent.TypePrefix + GenericEvent.SolutionDisplayed: // Help level accessed
        return -event.penalty; // -9999;
      case GenericEvent.TypePrefix + GenericEvent.GameSurrendered:
        return 0; // no score change?
      default:
        return 0;
    }
  }

  getFinalScores(events: GameEvents, information: GameInformation) {
    const scoresByLevel = this.getEachLevelScores(information, events);
    if (scoresByLevel.length < 1) { return []; }
    const finalScoresObject = {};
    const playerIds = Object.keys(scoresByLevel[0]);
    playerIds.forEach(id => {
      finalScoresObject[id] = 0;
      scoresByLevel.forEach(scores => {
        if (typeof scores[id] === 'undefined') {
          return;
        }
        finalScoresObject[id] += scores[id];
      });
    });

    const finalScoresArray = [];
    playerIds.forEach(id => {
      const player: {id: string; score: number} = {
        id: id,
        score: finalScoresObject[id]
      };
      finalScoresArray.push(player);
    });
    return finalScoresArray;
  }

  getGameMaxScore(information: GameInformation): number {
    if (information === null || information.levels === null) return 0;
    let maxScore = 0;
    information.levels.forEach((level: Level) => {
      maxScore += level.points;
    });
    return maxScore;
  }
}
