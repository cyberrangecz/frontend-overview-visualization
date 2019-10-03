import {Injectable} from '@angular/core';
import {BarVisualizationData} from '../components/clustering/interfaces/bar-visualization-data';
import {PlayerVisualizationData} from '../components/clustering/interfaces/player-visualization-data';
import {ProgressPlayer} from '../components/timeline/interfaces/progress-player';
import {TimeService} from './time.service';
import {ScoreService} from './score.service';
import {GameData} from '../shared/interfaces/game-data';
import {D3, D3Service} from 'd3-ng2-service';
import {Event} from '../shared/interfaces/event';
import {ScoredEvent} from '../components/timeline/interfaces/scored-event';
import {LevelEvents} from '../shared/interfaces/level-events';
import {GenericEvent} from '../shared/interfaces/generic-event.enum';

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
      const data: BarVisualizationData = {
        number: +levelNumber, maxTime: +maxTimes[levelNumber], avgTime: +avgTimes[levelNumber]
      };
      result.push(data);
    });
    return result;
  }

  getScoreLevelPlayersData(gameData: GameData): PlayerVisualizationData[][] {
    const scores = this.scoreService.getEachLevelScores(gameData.information, gameData.events);
    const times = this.timeService.getEachLevelPlayerTime(gameData.events);
    const result: PlayerVisualizationData[][] = [];
    scores.forEach((currentLevel: number, i) => {
      const levelData: PlayerVisualizationData[] = [];
      const playersInCurrentLevel = Object.keys(currentLevel);

      playersInCurrentLevel.forEach(playerId => {
        const playerData: PlayerVisualizationData = {
          id: playerId, score: +currentLevel[playerId], time: +times[i][playerId]
        };
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
      const playerData: PlayerVisualizationData = {
        id: player.id, score: +player.score, time: +times[player.id]
      };
      result.push(playerData);
    });
    return result;
  }

  getScoreFinalMaxTime(gameData: GameData, includeTimeGaps = false, enableAllPlayers = true, currentPlayer: string = null): number {
    if (!enableAllPlayers) { return this.timeService.getPlayerMaxTime(gameData.events, currentPlayer); }
    return this.timeService.getFinalMaxTime(gameData.events, includeTimeGaps);
  }

  getScoreFinalGameMaxScore(gameData: GameData): number {
    return this.scoreService.getGameMaxScore(gameData.information);
  }

  getScoreProgressPlayersWithEvents(gameData: GameData, enableAllPlayers: boolean = true, currentPlayer: string = null): ProgressPlayer[] {
    if (gameData.events === null) {
      return null;
    }
    const playersWithEvents = this.flattenAndGroupByPlayer(gameData.events.levels);
    const progressPlayers: ProgressPlayer[] = [];

    playersWithEvents.forEach(player => {
      const playerId: string = player.key;
      if (enableAllPlayers || currentPlayer === playerId) {
        const playerEvents: Event[] = player.values;
        const playerEventsGroupedByLevel = this.d3.nest().key((event: Event) => event.level.toString()).entries(playerEvents);
        const playerScoredEvents: ScoredEvent[] = this.getScoredEvents(playerEventsGroupedByLevel, gameData);
        progressPlayers.push({id: playerId, events: playerScoredEvents, checked: false});
      }
    });
    return progressPlayers;
  }

  getScoredEvents(eventsGroupedByLevel, gameData: GameData) {
    if (gameData.information === null || gameData.information.levels === null) {
      return [];
    }
    // const startTime = new Date(eventsGroupedByLevel[0].values[0].timestamp).getTime();
    let currentScore = 0;
    let time = 0;
    const playerScoredEvents: ScoredEvent[] = [];
    eventsGroupedByLevel.forEach((level, i) => {
      const levelNumber: number = +level.key;
      const levelEvents: Event[] = level.values;
      let currentLevelScore = gameData.information.levels[levelNumber - 1].points;

      levelEvents.forEach((event: Event, index: number) => {
        time = event.gametime;

        const eventLevel = gameData.information.levels[event['level'] - 1];
        const beforeChangeLevelScore = currentLevelScore;

        currentLevelScore = event.actualScore;
        const scoreChange = currentLevelScore - beforeChangeLevelScore;
        if (scoreChange !== 0) {
          const s: ScoredEvent = {
            time: time,
            type: event.levelType,
            score: currentScore + beforeChangeLevelScore,
            event: event.event,
            show: false,
            level: levelNumber,
            gameLevel: event.gameLevel
          };
          playerScoredEvents.push(s);
        }

        const scoredEvent: ScoredEvent = {
          time: time,
          type: event.levelType,
          score: currentScore + currentLevelScore,
          event: event.event,
          show: event.event === GenericEvent.TypePrefix + GenericEvent.GameStarted ? false : true,
          level: levelNumber,
          scoreChange: scoreChange,
          gameLevel: event.gameLevel
        };
        playerScoredEvents.push(scoredEvent);
      });
      currentScore += currentLevelScore;
    });
    return playerScoredEvents;
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
    if (scoresEachLevel.length < 1) {
      return {playerIds: [], levels: [], finalScores: []};
    }
    const playerIds = Object.keys(scoresEachLevel[0]);
    const finalScores = this.scoreService.getFinalScores(gameData.events, gameData.information);
    const scores = {};
    finalScores.forEach(player => {
      scores[player.id] = player.score;
    });
    const levelsData: {}[] = [];
    let currentLevelData = {};
    scoresEachLevel.forEach((level, i) => {
      const levelPlayerIds = Object.keys(level);
      levelPlayerIds.forEach(id => {
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
      finalScores: scores
    };
  }
}

