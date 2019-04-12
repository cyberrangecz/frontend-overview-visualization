import { Injectable } from '@angular/core';
import { GameInformation } from '../shared/interfaces/game-information';
import { GameEvents } from '../shared/interfaces/game-events';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {forkJoin, Observable} from 'rxjs';
import {Level} from '../shared/interfaces/level';
import {LevelEvents} from '../shared/interfaces/level-events';

@Injectable()
/**
 * Fetches the data from the REST API.
 */
export class DataService {
  token = 'eyJqa3UiOiJodHRwczpcL1wvb2lkYy5pY3MubXVuaS5jelwvb2lkY1wvandrIiwia2lkIjoicnNhMSIsImFsZyI6IlJTMjU2In0.' +
    'eyJzdWIiOiIzOTYyOTZAbXVuaS5jeiIsImF6cCI6IjU5M2JiZjQ5LWE4MmItNGY2ZS05YmFmLWM0ZWQ0ODhkNTA2NiIsImlzcyI6Imh0dH' +
    'BzOlwvXC9vaWRjLmljcy5tdW5pLmN6XC9vaWRjXC8iLCJleHAiOjE1NTUwNTYzNDcsImlhdCI6MTU1NTA1Mjc0NywianRpIjoiMjkzNDVm' +
    'NmQtNzViOS00ZGFjLTllNmItMTAyNDYyMDVjMjFmIn0.P6qtC6m9EFDCWh8aWL-rLKcD1GDObWzbo8ClkaKTiRkTGq_jPIIhub5v7SJttO' +
    'rEfSm4cdhzyGxCg838g6Fn_6ozSgwX3-CVjGf9aD7Ynyiyomr2VvO6cBSZ2kukxNBkT8FUldmHwOZ2zkpEEac9WesqqkJuyjg9zeIDHLro' +
    'X3mg4HKC63uhnzjcgs-E_egIrliZSo_qIczywpfQYiOUDsKEuj3HFcV1aS750tUdGagonk_h1IOdUtI_Bl8Ey91Xenc-BWuq_HKlF5dkq1' +
    'PtpOQYrTm799PbEpz6FBu6I9KjNGr5GabR2JABRZh-djaS6uG3KtStIEY4uOcwD8QT9Q';
  baseUrl = 'http://147.251.21.216:8083/kypo2-rest-training/api/v1';
  constructor(private http: HttpClient) { }

  public getAllData() {
    return forkJoin([
      this.getInformation(),
      this.getEvents()
    ]).pipe(map(
      (data: any[]) => {
        const info = data[0];
        const events = data[1];

        const result = this.processData(info, events);
        return result;
      }
    ));
  }

  processData(info, events): [GameInformation, GameEvents] {
    const gameInfo: GameInformation = {
      name: info.title,
      levels: this.loadLevels(info.levels),
      estimatedTime: info.levels.length * 900
    };

    const levels: LevelEvents[] = this.initializeLevels(info.levels.length);
    const gameEvents: GameEvents = {
      levels: levels,
    };

    return [gameInfo, gameEvents];
  }

  loadLevels(levels): Level[] {
    const newLevels: Level[] = [];
    let levelNum = 1;
    levels.forEach((level) => {
      const l: Level = {
        name: level.title,
        number: levelNum++,
        estimatedTime: 900,
        points: level.max_score,
        hints: level.hints === undefined ? [] : level.hints
      };
      newLevels.push(l);
    });
    return newLevels;
  }

  initializeLevels(size: number): LevelEvents[] {
    const levels: LevelEvents[] = [];
    for (let i = 1; i <= size; i++) {
      levels.push({number: i, events: []});
    }
    return levels;
  }

  /**
   * Fetches static game information data
   */
  getInformation(): Observable<GameInformation> {
    const headers = new HttpHeaders().set('authorization', 'Bearer ' + this.token);
    return this.http.get<GameInformation>(`${this.baseUrl}/training-definitions/1`, {headers});
     // .toPromise()
     // .then(response => response);
  }

  /**
   * Fetches game events data
   */
  getEvents(): Promise<any> {
    const headers = new HttpHeaders().set('authorization', 'Bearer ' + this.token);
    return this.http.get(`${this.baseUrl}/training-events/training-definitions/1/training-instances/1`, {headers})
      .toPromise()
      .then(response => response);
  }
}
