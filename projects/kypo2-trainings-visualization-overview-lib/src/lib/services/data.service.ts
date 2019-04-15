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

@Injectable()
/**
 * Fetches the data from the REST API.
 */
export class DataService {
  token = 'eyJqa3UiOiJodHRwczpcL1wvb2lkYy5pY3MubXVuaS5jelwvb2lkY1wvandrIiwia2lkIjoicnNhMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzOTYyOTZAbXVuaS5jeiIsImF6cCI6IjU5M2JiZjQ5LWE4MmItNGY2ZS05YmFmLWM0ZWQ0ODhkNTA2NiIsImlzcyI6Imh0dHBzOlwvXC9vaWRjLmljcy5tdW5pLmN6XC9vaWRjXC8iLCJleHAiOjE1NTUzNDYzNjEsImlhdCI6MTU1NTM0Mjc2MSwianRpIjoiNWFjOWYzZGMtNTdhYy00ZTI1LTkwNjItZTI1YzhiZDVlNTM0In0.LdTzGD1pre4HO483EeUMwcAx8Y8dH9vJdJJngUvzz6Ta0eCtQPQm6ggwWS93_AQnrvjKXwSxTkVE1unSlgQsaEfqTweBcKKBuSOuzhcVDhxj5qGxFPp466qWjs7C7qKkoGaJDexHPiRX4XqaQmydMWcrvSieudo9U44LVYpHvhPX6nYlMiXuDmPX011UfCFQWlruIp-aJBSBR9zkybmu9eTGbjv2H9NsbaHxfARxCtpKiAr9ryelx3I_JSjD2G63XT6i0wQRX0piH56W-MexVIfCqw2mx2ragU62hDBOhYGSAWr5vHCO849j6Srf0AWdzZSdEYto4gU4DBEZfxXD7g';
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

    // console.log(gameInfo);
    // console.log(gameEvents);
    return [gameInfo, gameEvents];
  }

  loadLevels(levels): Level[] {
    const newLevels: Level[] = [];
    let levelNum = 1;
    levels.forEach((level) => {
      if (level.level_type === 'GAME_LEVEL') {
        // first we get all the hints of a level
        const hints: Hint[] = [];
        level.hints.forEach((hint, i) => {
          const h: Hint = {points: hint.hint_penalty, number: i + 1, id: hint.id};
          hints.push(h);
        });

        // then we can create new level
        const l: Level = {
          name: level.title,
          number: levelNum++,
          estimatedTime: 900,
          points: level.max_score,
          hints: hints,
          id: level.id
        };
        newLevels.push(l);
      }
    });
    return newLevels;
  }

  initializeLevels(allLevels: any[]): LevelEvents[] {
    const levels: LevelEvents[] = [];
    let levelNum = 1;
    for (let i = 0; i < allLevels.length; i++) {
      if (allLevels[i].level_type === 'GAME_LEVEL') {
        levels.push({id: allLevels[i].id, number: levelNum++, events: []});
      }
    }
    return levels;
  }

  sortAllEvents(levels: LevelEvents[], events: any[]): LevelEvents[] {
    events.forEach((event) => {
      let e: Event;
      // so far, we dont want any info or assessment levels
      if (event.level_type === undefined || event.level_type === 'GAME') {
        e = {
          playerId: event.player_login,
          timestamp: event.timestamp,
          gametime: event.game_time / 1000,
          event: event.type,
          actualScore: event.actual_score_in_level};

        levels.forEach((level) => {
          if (level.id === event.level) {
            level.events.push(e);
          }
        });
      }
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
