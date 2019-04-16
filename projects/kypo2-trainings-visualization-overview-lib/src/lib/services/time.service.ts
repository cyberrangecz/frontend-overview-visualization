import { Injectable } from '@angular/core';
import {GameEvents} from '../shared/interfaces/game-events';
import {D3, D3Service} from 'd3-ng2-service';
import { Event } from '../shared/interfaces/event';

@Injectable()
/**
 * Computes all necessary data concerning game time (max game times, average, etc.)
 */
export class TimeService {

  private d3: D3;
  private playersMaximumTimes = null;

  constructor(d3: D3Service) {
    this.d3 = d3.getD3();
  }

  getEachLevelMaxTimes(events: GameEvents) {
    const times = this.getEachLevelPlayerTime(events);
    const maximumTimesOfEachLevel = {};
    times.forEach((currentLevelTimes, i) => {
      maximumTimesOfEachLevel[i + 1] = +this.d3.max(<any>Object.values<number>(currentLevelTimes));
      if (isNaN(maximumTimesOfEachLevel[i + 1]) ) { maximumTimesOfEachLevel[i + 1] = 0; }
    });
    return maximumTimesOfEachLevel;
  }

  getEachLevelAvgTimes(events: GameEvents) {

    const times = this.getEachLevelPlayerTime(events);
    const averageTimesOfEachLevel = {};
    times.forEach((currentLevelTimes, i) => {
      averageTimesOfEachLevel[i + 1] = +this.d3.mean(<any>Object.values<number>(currentLevelTimes));
      if (isNaN(averageTimesOfEachLevel[i + 1]) ) { averageTimesOfEachLevel[i + 1] = 0; }
    });
    return averageTimesOfEachLevel;
  }

  getMaximumTimeByLevel(events: GameEvents, level: number): number {
    return this.d3.max(events.levels[ level - 1 ].events, (e: Event) => e.gametime);
  }

  getFinalMaxTime(events: GameEvents, includeTimeGaps: boolean = false): number {
    return <any>Object.values<number>(this.getFinalPlayersMaxTimes(events, includeTimeGaps)).reduce((a, b) => Math.max(a, b));
  }

  getFinalAvgTime(events: GameEvents): number {
    const times = <any>Object.values<number>(this.getFinalPlayersMaxTimes(events));
    return this.d3.mean(times);
  }

  getFinalPlayersMaxTimes(events: GameEvents, includeTimeGaps: boolean = false) {
    const playersMaxTimes = {};
    const flattenedEvents = this.flattenEvents(events);

    const eventsGroupedByPlayer = this.d3.nest().key((event: Event) => event.playerId).entries(flattenedEvents);

    eventsGroupedByPlayer.forEach(player => {
      let time: any;
      //if (!player.values[player.values.length - 1].gametime === undefined) {
        time = new Date(player.values[player.values.length - 1].gametime).getTime();
        playersMaxTimes[player.key] = time;
      /*} else {
        const startTimestamp: any = this.d3.min(player.values, (event: Event) => event.timestamp);
        const endTimestamp: any =  this.d3.max(player.values, (event: Event) => event.timestamp);
        time = new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime();
        playersMaxTimes[player.key] = time / 1000;
      }*/
    });
    return playersMaxTimes;
  }

  flattenEvents(events: GameEvents) {
    const flattenedEvents = [];
    events.levels.forEach(level => {
      flattenedEvents.push(...level.events);
    });
    return flattenedEvents;
  }

  getEachLevelPlayerTime(events: GameEvents) {
    if (events === null || events.levels === null ) {
      return [];
    }
    const result = [];
    const lastEvents = {};
    events.levels.forEach(level => {
      const playersMaxTimes = {};
      const playerNest = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
      playerNest.forEach(player => {
        const startTimestamp = player.values[0].gametime;
        const endTimestamp = player.values[player.values.length - 1].gametime;
        lastEvents[player.key] = endTimestamp;
        const time = new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime();
        playersMaxTimes[player.key] = time;
      });
      result.push(playersMaxTimes);
    });
    return result;
  }

}
