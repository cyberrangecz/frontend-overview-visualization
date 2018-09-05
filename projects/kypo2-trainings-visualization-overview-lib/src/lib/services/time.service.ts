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
    });
    return maximumTimesOfEachLevel;
  }

  getEachLevelAvgTimes(events: GameEvents) {

    const times = this.getEachLevelPlayerTime(events);
    const averageTimesOfEachLevel = {};
    times.forEach((currentLevelTimes, i) => {
      averageTimesOfEachLevel[i+1] = +this.d3.mean(<any>Object.values<number>(currentLevelTimes));
    });
    return averageTimesOfEachLevel;
  }

  getMaximumTimeByLevel(events: GameEvents, level: number): number {
    return this.d3.max(events.levels[ level - 1 ].events, (e: Event) => e.gametime);
  }

  getFinalMaxTime(events: GameEvents): number {
    return <any>Object.values<number>(this.getFinalPlayersMaxTimes(events)).reduce((a, b) => Math.max(a, b));
  }

  getFinalAvgTime(events: GameEvents): number {
    const times = <any>Object.values<number>(this.getFinalPlayersMaxTimes(events));
    return this.d3.mean(times);
  }

  getFinalPlayersMaxTimes(events: GameEvents) {
    const playersMaxTimes = {};
    const flattenedEvents = this.flattenEvents(events);

    const eventsGroupedByPlayer = this.d3.nest().key((event: Event) => event.playerId).entries(flattenedEvents);

    eventsGroupedByPlayer.forEach(player => {
      const startTimestamp = this.d3.min(player.values, (event: Event) => event.timestamp);
      const endTimestamp = this.d3.max(player.values, (event: Event) => event.timestamp);
      const time = new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime();
      playersMaxTimes[player.key] = time/1000;
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
    if (events.levels === null ) {
      return null;
    }
    const result = [];
    const lastEvents = {};
    events.levels.forEach(level => {
      const playersMaxTimes = {};
      const playerNest = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
      playerNest.forEach(player => {
        const startTimestamp = (typeof lastEvents[player.key] === 'undefined') ? player.values[0].timestamp : lastEvents[player.key];
        const endTimestamp = this.d3.max(player.values, (event: Event) => event.timestamp);
        lastEvents[player.key] = endTimestamp;
        const time = new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime();
        playersMaxTimes[player.key] = time/1000;
      });
      result.push(playersMaxTimes);
    });
    return result;
  }

}
