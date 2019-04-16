import { Injectable } from '@angular/core';
import { BarVisualizationData } from '../components/clustering/interfaces/bar-visualization-data';
import { PlayerVisualizationData } from '../components/clustering/interfaces/player-visualization-data';
import { ProgressPlayer } from '../components/timeline/interfaces/progress-player';
import { TimeService } from './time.service';
import { ScoreService } from './score.service';
import { GameData } from '../shared/interfaces/game-data';
import { D3Service, D3 } from 'd3-ng2-service';
import { Event } from '../shared/interfaces/event';
import { ScoredEvent } from '../components/timeline/interfaces/scored-event';
import { LevelEvents } from '../shared/interfaces/level-events';

@Injectable()
/**
 * Prepares the final processed data for each visualizations. Wraps the data in defined objects/interfaces.
 */
export class DataProcessor {

  private d3: D3;

  constructor(private timeService: TimeService, private scoreService: ScoreService, d3service: D3Service) {
    this.d3 = d3service.getD3();
   }

  getScoreLevelBarsData(gameData: GameData): BarVisualizationData[] {
    const maxTimes = this.timeService.getEachLevelMaxTimes(gameData.events);
    const avgTimes = this.timeService.getEachLevelAvgTimes(gameData.events);
    const result: BarVisualizationData[] = [];
    Object.keys(maxTimes).forEach(levelNumber => {
      const data: BarVisualizationData = {  number: +levelNumber,
                                            maxTime: +maxTimes[levelNumber],
                                            avgTime: +avgTimes[levelNumber] };
      result.push(data);
    });
    return result;
  }

  getScoreLevelPlayersData(gameData: GameData): PlayerVisualizationData[][] {
    const scores = this.scoreService.getEachLevelScores(gameData.information, gameData.events);
    const times = this.timeService.getEachLevelPlayerTime(gameData.events);
    const result: PlayerVisualizationData[][] = [];

    scores.forEach((currentLevel, i) => {

      const levelData: PlayerVisualizationData[] = [];
      const playersInCurrentLevel = Object.keys(currentLevel);

      playersInCurrentLevel.forEach(playerId => {
        const playerData: PlayerVisualizationData = { id: playerId,
                                                      score: +currentLevel[playerId],
                                                      time: +times[i][playerId]};
        levelData.push(playerData);
      });
      result.push(levelData);
    });
    return result;
  }

  getScoreLevelMaxTime(gameData: GameData): number {
    const maxTimes = this.timeService.getEachLevelMaxTimes(gameData.events);
    const maxTimesArray = <any>Object.values(maxTimes).map(string => +string);
    return Math.max(...maxTimesArray);
  }

  getScoreFinalBarsData(gameData: GameData): BarVisualizationData {
    const result: BarVisualizationData = {
      maxTime: this.timeService.getFinalMaxTime(gameData.events),
      avgTime: this.timeService.getFinalAvgTime(gameData.events)
    };
    return result;
  }

  getScoreFinalPlayersData(gameData: GameData): PlayerVisualizationData[] {
    const scores = this.scoreService.getFinalScores(gameData.events, gameData.information);
    const times = this.timeService.getFinalPlayersMaxTimes(gameData.events);
    const result = [];
    scores.forEach(player => {
      const playerData: PlayerVisualizationData = {id: player.id,
                                                   score: +player.score,
                                                   time: +times[player.id]
                                                  };
      result.push(playerData);
    });
    return result;
  }

  getScoreFinalMaxTime(gameData: GameData, includeTimeGaps: boolean = false): number {
    return this.timeService.getFinalMaxTime(gameData.events, includeTimeGaps);
  }

  getScoreFinalGameMaxScore(gameData: GameData): number {
    return this.scoreService.getGameMaxScore(gameData.information);
  }

  getScoreProgressPlayersWithEvents(gameData: GameData): ProgressPlayer[] {
    const playersWithEvents = this.flattenAndGroupByPlayer(gameData.events.levels);
    const progressPlayers: ProgressPlayer[] = [];

    playersWithEvents.forEach(player => {
      const playerId: string = player.key;
      const playerEvents: Event[] = player.values;
      console.log(playerEvents);
      const playerEventsGroupedByLevel = this.d3.nest().key((event: Event) => event.level.toString()).entries(playerEvents);
      const playerScoredEvents: ScoredEvent[] = this.getScoredEvents(playerEventsGroupedByLevel, gameData);
      progressPlayers.push({id: playerId, events: playerScoredEvents, checked: false});
    });
    return progressPlayers;
  }

  getScoredEvents(eventsGroupedByLevel, gameData: GameData) {
    if (gameData.information === null ||  gameData.information.levels === null) return [];
    const startTime = new Date(eventsGroupedByLevel[0].values[0].timestamp).getTime();
    let currentScore = 0;
    let time = 0;
    const playerScoredEvents: ScoredEvent[] = [];
    eventsGroupedByLevel.forEach((level, i) => {
      const levelNumber: number = +level.key;
      const levelEvents: Event[] = level.values;
      let currentLevelScore = gameData.information.levels[levelNumber - 1].points;
      if (i !== 0) {
        playerScoredEvents.push({time: time,
          score: currentScore + currentLevelScore,
          event: 'Correct flag submited',
          show: false,
          level: levelNumber
        });
      }
      levelEvents.forEach((event: Event) => {
        time = event.gametime; // to seconds

        const level = gameData.information.levels[event['level'] - 1];
        const beforeChangeLevelScore = currentLevelScore;

        currentLevelScore = this.updateLevelScore(event, level, currentLevelScore);

        if (beforeChangeLevelScore !== currentLevelScore) {
          const scoredEvent: ScoredEvent = {
            time: time,
            score: currentScore + beforeChangeLevelScore,
            event: event.event,
            show: false,
            level: levelNumber
          };
          playerScoredEvents.push(scoredEvent);
        }

        const scoreChange = (event.event.toUpperCase().split(' ')[0] === 'CORRECT') ?
          gameData.information.levels[levelNumber % gameData.information.levels.length].points :
          currentLevelScore - beforeChangeLevelScore;

        const scoredEvent: ScoredEvent = {
          time: time,
          score: currentScore + currentLevelScore,
          event: event.event,
          show: true,
          level: levelNumber,
          scoreChange: scoreChange
        };
        playerScoredEvents.push(scoredEvent);
      });
      currentScore += currentLevelScore;
    });
    return playerScoredEvents;
  }

  updateLevelScore(event: Event, level, currentLevelScore) {
    const split = event.event.toUpperCase().split(' ');
    switch (split[0]) {
      case 'HINT':
        currentLevelScore += this.scoreService.getHintScore(level, event);
        break;
      case 'HELP':
        currentLevelScore = 0;
        break;
      case 'LEVEL':
        currentLevelScore = 0;
        break;
      case 'GAME':
        if (split[1] === 'EXITED') {
          currentLevelScore = 0;
        }
        break;
    }
    return currentLevelScore;
  }

  flattenAndGroupByPlayer(levelEvents: LevelEvents[]) {
    const flattenedEvents = levelEvents
      .map(level => level.events
        .map((event: Event) => Object.assign(event, {level: +level.number})));
    const events = flattenedEvents.reduce((acc, curr) => acc.concat(curr));
    const groupedByPlayer = this.d3.nest().key((event: Event) => event.playerId).entries(events);
    return groupedByPlayer;
  }

  getScoreTableData(gameData: GameData) {
    const hintsTakenEachLevel = this.scoreService.getEachLevelHintsTaken(gameData.information, gameData.events);
    const scoresEachLevel = this.scoreService.getEachLevelScores(gameData.information, gameData.events);
    const wrongFlagsSubmittedEachLevel = this.scoreService.getEachLevelWrongFlags(gameData.information, gameData.events);
    if(scoresEachLevel.length < 1) return {playerIds: [], levels: [], finalScores: []};
    const playerIds = Object.keys(scoresEachLevel[0]);
    const finalScores = this.scoreService.getFinalScores(gameData.events, gameData.information);
    const scores = {};
    finalScores.forEach(player => {
      scores[player.id] = player.score;
    });
    const levelsData: {}[] = [];
    let currentLevelData = {};
    scoresEachLevel.forEach((level, i) => {
      const playerIds = Object.keys(level);
      playerIds.forEach(id => {
        const scoreInCurrentLevel = level[id];
        const hintsTakenInCurrentLevel = hintsTakenEachLevel[i][id];
        const wrongFlagsSubmittedInCurrentLevel = wrongFlagsSubmittedEachLevel[i][id];
        currentLevelData[id] = {
          score: scoreInCurrentLevel,
          hints: hintsTakenInCurrentLevel,
          wrongFlags: wrongFlagsSubmittedInCurrentLevel
        };
      });
      levelsData.push(currentLevelData);
      currentLevelData = {};
    });

    return {
      playerIds: playerIds,
      levels: levelsData,
      finalScores: scores};
  }
}
