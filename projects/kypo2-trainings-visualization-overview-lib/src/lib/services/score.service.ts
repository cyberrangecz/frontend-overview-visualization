import {Injectable} from '@angular/core';
import {GameEvents} from '../shared/interfaces/game-events';
import {D3, D3Service} from '@kypo/d3-service';
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
        const levelGroupedEvents = this.d3.nest().key((e: Event) => e.playerId.toString()).entries(level.events);
        const levelInfo = information.levels[levelNumbers++];
        levelGroupedEvents.forEach(player => {
          levelGroup[player.key] = player.values[player.values.length - 1].actualScore;
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
        const playerEvents = this.d3.nest().key((event: Event) => event.playerId.toString()).entries(level.events);
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
    if (information === null || information.levels === null) { return 0; }
    let maxScore = 0;
    information.levels.forEach((level: Level) => {
      maxScore += level.points;
    });
    return maxScore;
  }
}
