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

@Injectable()
/**
 * Fetches the data from the REST API.
 */
export class DataService {
  token = 'eyJqa3UiOiJodHRwczpcL1wvb2lkYy5pY3MubXVuaS5jelwvb2lkY1wvandrIiwia2lkIjoicnNhMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzOTYyOTZAbXVuaS5jeiIsImF6cCI6IjU5M2JiZjQ5LWE4MmItNGY2ZS05YmFmLWM0ZWQ0ODhkNTA2NiIsImlzcyI6Imh0dHBzOlwvXC9vaWRjLmljcy5tdW5pLmN6XC9vaWRjXC8iLCJleHAiOjE1NTU0OTYyMjgsImlhdCI6MTU1NTQ5MjYyOCwianRpIjoiNTg5NjJjM2ItNTA3Ni00Y2QyLWIyZGQtM2E0YjA2ZmIwYmUwIn0.CEYJqnPxM2kDozcxPgR-8ecADqjtSxQ98I5V44Uilbe6b9zn6JjgCowsLtZUSwLek9Izm6SZzXjHVsqwFdysd-ZjnGjngKqY8DV5ls1iWzcr1eWlfxUHSzmq9uf3g4YHc0DjNV0-MfvnMpVXeN2PgQJqLwlZIMVpvuwNbr-vo8wyEpk9PH5Wmb0zpKbspyFsVyiak2jV1l-rK27CrFQ3XMaNmrbXHhDzxeC33x7aJlOK99BUrk9I0chQEpMkWqqIirJ62-fCOFE_sJDoChOH10zQ1hXjVUIJDsMPHzCBTs7A4o_-SnFDBfvvYvSgirkp4cAvVglJEP2p2Aex40ViWw';
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

  private loadLevels(levels): Level[] {
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
          estimatedTime: 1000,
          points: level.max_score,
          hints: hints,
          id: level.id
        };
        newLevels.push(l);
      }
    });
    return newLevels;
  }

  private initializeLevels(allLevels: any[]): LevelEvents[] {
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

        if (event.type === GenericEvent.HintTaken) {
          e.penalty = event.hint_penalty_points;
        }
        if (event.type === GenericEvent.SolutionDisplayed) {
          e.penalty = event.penalty_points;
        }

        levels.forEach((level) => {
          if (level.id === event.level) {
            level.events.push(e);
          }
        });
      }

    });

    console.log(levels);
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
