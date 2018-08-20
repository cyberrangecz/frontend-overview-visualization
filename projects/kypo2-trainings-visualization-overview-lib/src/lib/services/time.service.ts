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
      maximumTimesOfEachLevel[i + 1] = +this.d3.max(Object.values<number>(currentLevelTimes));
    });
    return maximumTimesOfEachLevel;
  }

  getEachLevelAvgTimes(events: GameEvents) {

    const times = this.getEachLevelPlayerTime(events);
    const averageTimesOfEachLevel = {};
    times.forEach((currentLevelTimes, i) => {
      averageTimesOfEachLevel[i+1] = +this.d3.mean(Object.values<number>(currentLevelTimes));
    });
    return averageTimesOfEachLevel;
  }

  getMaximumTimeByLevel(events: GameEvents, level: number): number {
    return this.d3.max(events.levels[ level - 1 ].events, (e: Event) => e.gametime);
  }

  getFinalMaxTime(events: GameEvents): number {
    return Object.values<number>(this.getFinalPlayersMaxTimes(events)).reduce((a, b) => Math.max(a, b));
  }

  getFinalAvgTime(events: GameEvents): number {
    const times = Object.values<number>(this.getFinalPlayersMaxTimes(events));
    return this.d3.mean(times);
  }

  getFinalPlayersMaxTimes(events: GameEvents) {
    const playersMaxTimes = {};
    // For each level, group teams and get their max gametime, next level add up to the gametime
    events.levels.forEach(level => {
      const playerNest = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
      playerNest.forEach(player => {
        const maxTime = this.d3.max(player.values, (e: Event) => e.gametime);
        playersMaxTimes[player.key] = (level.number <= 1) ? maxTime : playersMaxTimes[player.key] + maxTime;
      });
    });
    return playersMaxTimes;
  }

  getEachLevelPlayerTime(events: GameEvents) {
    if (events.levels === null ) {
      return null;
    }
    const result = [];
    events.levels.forEach(level => {
      const playersMaxTimes = {};
      const playerNest = this.d3.nest().key((e: Event) => e.playerId).entries(level.events);
      playerNest.forEach(player => {
        playersMaxTimes[player.key] = this.d3.max(player.values, (e: Event) => e.gametime);
      });
      result.push(playersMaxTimes);
    });
    return result;
  }

}
