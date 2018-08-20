import { Injectable } from '@angular/core';
import { GameEvents } from '../shared/interfaces/game-events';
import { D3, D3Service } from 'd3-ng2-service';
import { Event} from '../shared/interfaces/event';
import { Level } from '../shared/interfaces/level';
import { GameInformation } from '../shared/interfaces/game-information';

@Injectable()
/**
 * Computes all necessary data concerning score (scoring system, max. score in game, etc.)
 */
export class ScoreService {

  private d3: D3;

  constructor(d3: D3Service) {
    this.d3 = d3.getD3();
  }

  getEachLevelScores(information: GameInformation, events: GameEvents): {}[] {
    const eachLevelScores = [];
    let levelGroup = {};
    events.levels.forEach(level => {
      const levelGroupedEvents = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
      const levelInfo = information.levels[ level.number - 1 ];
      levelGroupedEvents.forEach(player => {
        player.values.forEach((event, i) => {

          // Assign level's max points to player on first assignment to prevent adding up to undefined => NaN
          const isFirstAssignment: boolean = (i < 1);
          if (isFirstAssignment) {levelGroup[player.key] = levelInfo.points; }

          levelGroup[player.key] += this.getScore(levelInfo, event);

          const isNegative = levelGroup[player.key] < 0;
          if (isNegative) {levelGroup[player.key] = 0; } // If level skipped, help level accessed or exited prematurely

        });
      });
      eachLevelScores.push(levelGroup);
      levelGroup = {};
    });
    return eachLevelScores;
  }

  /**
   * Count hints that player took in each level and return an array of objects {playerId : hintsTaken}
   * @param information
   * @param events 
   */
  getEachLevelHintsTaken(information: GameInformation, events: GameEvents): {}[] {
    return this.getEachLevelEventCountByType("hint", information, events);
  }

    /**
   * Count wrong flags submitted in each level and return an array of objects {playerId : wrong flags submitted}
   * @param information
   * @param events 
   */
  getEachLevelWrongFlags(information: GameInformation, events: GameEvents): {}[] {
    return this.getEachLevelEventCountByType("wrong", information, events);
  }

  getEachLevelEventCountByType(type: string, information: GameInformation, events: GameEvents) {
    const result: {}[] = [];
    const levels = events.levels;
    let playerWantedEventsInCurrentLevel = {};
    levels.forEach(level => {
      const playerEvents = this.d3.nest().key((event: Event) => event.playerId).entries(level.events);
      playerEvents.forEach(player => {
        const playerId = player.key;
        const events = player.values;
        const isWantedType = (currentValue: Event) => currentValue.event.toUpperCase().split(' ')[0] === type.toUpperCase();
        const eventCounterFunction = (accumulator, currentValue: Event) => isWantedType(currentValue) ? accumulator + 1 : accumulator;
        const eventCount = events.reduce(eventCounterFunction, 0);
        playerWantedEventsInCurrentLevel[playerId] = eventCount;
      });
      result.push(playerWantedEventsInCurrentLevel);
      playerWantedEventsInCurrentLevel = {};
    });
    return result;
  }

  getScore(level: Level, event: Event): number {
    switch (event.event.toUpperCase().split(' ')[0]) {
      case 'CORRECT': // Correct flag submited
        return 0;
      case 'HINT': // Hint # taken
        return this.getHintScore(level, event);
      case 'HELP': // Help level accessed
        return -9999;
      case 'LEVEL': // Level skipped
        return -9999;
      case 'GAME': // Exited prematurely
        const exited: boolean = event.event.toUpperCase().split(' ')[1] === 'EXITED';
        if (exited) {
          return -9999;
        } else {
          return 0;
        }
      default:
        return 0;
    }
  }

  getHintScore(level: Level, event: Event): number {
    const hintNumberTaken = +event.event.toLowerCase().split(' ')[1];
    return -level.hints[hintNumberTaken - 1].points;
  }

  getFinalScores(events: GameEvents, information: GameInformation) {
    let scoresByLevel = this.getEachLevelScores(information, events);
    
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
      const player: {id: number; score: number} = {
        id: +id,
        score: finalScoresObject[id]
      };
      finalScoresArray.push(player);
    });
    return finalScoresArray;
  }

  getGameMaxScore(information: GameInformation): number {
    let maxScore = 0;
    information.levels.forEach((level: Level) => {
      maxScore += level.points;
    });
    return maxScore;
  }
}
