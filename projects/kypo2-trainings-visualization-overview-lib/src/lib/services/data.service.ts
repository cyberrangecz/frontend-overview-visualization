import { Injectable } from '@angular/core';
import { GameInformation } from '../shared/interfaces/game-information';
import { GameEvents } from '../shared/interfaces/game-events';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import { Event } from '../shared/interfaces/event';
import {forkJoin, Observable, throwError} from 'rxjs';
import {Level} from '../shared/interfaces/level';
import {LevelEvents} from '../shared/interfaces/level-events';
import {Hint} from '../shared/interfaces/hint';
import {GenericEvent} from '../shared/interfaces/generic-event.enum';
import {GAME_INFORMATION} from '../../../../../src/app/mocks/information.mock';
import {EVENTS} from '../../../../../src/app/mocks/events.mock';

@Injectable()
/**
 * Fetches the data from the REST API.
 */
export class DataService {
  token = 'tokenString';
  baseUrl = 'http://147.251.21.216:8083/kypo2-rest-training/api/v1';
  constructor(private http: HttpClient) { }

  public getAllData() {
    return forkJoin([
      this.getInformation(),
      this.getEvents()
    ]).pipe(map(
      (data) => {
        const info = data[0];
        const events = data[1];

        const result = this.processData(info, events);
        return result;
      }
    ), catchError( (error) => {
      return throwError('Could not connect to API: ' + error.message);
    }));
  }

  processData(info, events): [GameInformation, GameEvents] {
    // we acquire game info first
    const gameInfo: GameInformation = {
      name: info.title,
      levels: this.loadLevels(info.levels),
      estimatedTime: info.levels.length * 900
    };

    // then we get level-divided event structure
    let levels: LevelEvents[] = this.initializeLevels(info.levels);
    // and finally we put all events into suitble levels
    levels = this.sortAllEvents(levels, events);
    const gameEvents: GameEvents = {
      levels: levels,
    };

    return [gameInfo, gameEvents];
  }

  private loadLevels(levels): Level[] {
    const newLevels: Level[] = [];
    let levelNum = 1;
    let gameLevelNum = 1;
    levels.forEach((level) => {
      const l: Level = {
        type: level.level_type,
        name: level.title,
        number: levelNum++,
        estimatedTime: 200,
        points: level.max_score,
        id: level.id
      };

      if (level.level_type === 'GAME_LEVEL') {
        const hints: Hint[] = [];
        level.hints.forEach((hint, i) => {
          const h: Hint = {points: hint.hint_penalty, number: i + 1, id: hint.id};
          hints.push(h);
        });

        l.hints = hints;
        l.gameLevelNumber = gameLevelNum++;
        l.estimatedTime = 1000;
      } else if (level.level_type === 'ASSESSMENT_LEVEL') {
        // TODO
      }
      newLevels.push(l);
    });
    return newLevels;
  }

  private initializeLevels(allLevels: any[]): LevelEvents[] {
    const levels: LevelEvents[] = [];
    let levelNum = 1;
    let gameLevelNum = 1;
    for (let i = 0; i < allLevels.length; i++) {
      const newLevel: LevelEvents = {
        type: allLevels[i].level_type,
        id: allLevels[i].id,
        number: levelNum++,
        events: []};
      if (allLevels[i].level_type === 'GAME_LEVEL') {
        newLevel.gameLevelNumber = gameLevelNum++;
      }
      levels.push(newLevel);
    }
    return levels;
  }

  sortAllEvents(levels: LevelEvents[], events: any[]): LevelEvents[] {
    events.forEach((event) => {
      const e: Event = {
          levelType: event.level_type,
          playerId: event.player_login,
          timestamp: event.timestamp,
          gametime: event.game_time / 1000,
          event: event.type,
          actualScore: event.actual_score_in_level,
          penalty: 0,
      };

      if (event.level_type === undefined) { e.levelType = 'GAME'; }

      // so far, we do not process info or assessment levels
      if (event.level_type === undefined || event.level_type === 'GAME') {
        if (event.type === GenericEvent.TypePrefix + GenericEvent.HintTaken) {
          e.penalty = event.hint_penalty_points;
        }
        if (event.type === GenericEvent.TypePrefix + GenericEvent.SolutionDisplayed) {
          e.penalty = event.penalty_points;
        }
      }

      levels.forEach((level) => {
        if (level.id === event.level) {
          if (level.gameLevelNumber !== undefined) { e.gameLevel = level.gameLevelNumber; }
          level.events.push(e);
        }
      });
    });

    return levels;
  }

  /**
   * Fetches static game information data
   */
  getInformation(): Observable<any> {
    const headers = new HttpHeaders().set('authorization', 'Bearer ' + this.token);
    return this.http.get<GameInformation>(`${this.baseUrl}/training-definitions/4`, {headers});
  }

  /**
   * Fetches game events data
   */
  getEvents(): Observable<any> {
    const headers = new HttpHeaders().set('authorization', 'Bearer ' + this.token);
    return this.http.get(`${this.baseUrl}/training-events/training-definitions/4/training-instances/5`, {headers});
  }
}
