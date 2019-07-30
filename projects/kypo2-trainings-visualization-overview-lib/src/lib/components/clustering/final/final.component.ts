import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges
} from '@angular/core';
import { GameData } from '../../../shared/interfaces/game-data';
import { D3, ScaleLinear, D3Service, ContainerElement } from 'd3-ng2-service';
import { DataProcessor } from '../../../services/data-processor.service';
import {
  BAR_CONFIG,
  SVG_CONFIG,
  SVG_MARGIN_CONFIG,
  PLAYER_POINT_CONFIG,
  AXES_CONFIG,
  CROSSHAIR_CONFIG
} from './config';
import { BarVisualizationData } from '../interfaces/bar-visualization-data';
import { PlayerVisualizationData } from '../interfaces/player-visualization-data';
import { ClusteringFinalEventService } from '../interfaces/clustering-final-event-service';
import { SvgConfig } from '../../../shared/interfaces/configurations/svg-config';
import {GameInformation} from '../../../shared/interfaces/game-information';
import {GameEvents} from '../../../shared/interfaces/game-events';
import {DataService} from '../../../services/data.service';
import {EMPTY_INFO} from '../../../shared/mocks/information.mock';
import {EMPTY_EVENTS} from '../../../shared/mocks/events.mock';

@Component({
  selector: 'kypo2-viz-overview-final',
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.css']
})
export class FinalComponent implements OnInit, OnChanges {
  @Input() data: GameData;
  @Input() jsonGameData = {information: null, events: null};;
  @Input() useLocalMock = false;
  @Input() inputSelectedPlayerId: string;
  @Input() feedbackLearnerId: string;
  @Input() colorScheme: string[];
  @Input() eventService: ClusteringFinalEventService;
  @Input() size: SvgConfig;
  @Output() outputSelectedPlayerId = new EventEmitter<string>();

  private d3: D3;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;
  private svg; // D3 selection of main <svg> element

  private barWidth;
  private svgHeight;
  private svgWidth;
  private tickLength = 1;

  private playerClicked = false; // If no player is selected, hover out of player will cancel the highlight

  constructor(d3: D3Service, private visualizationService: DataProcessor, private dataService: DataService) {
    this.d3 = d3.getD3();
  }

  ngOnInit() {
    if (!this.useLocalMock) { this.load(); }
  }

  load() {
    this.dataService.getAllData().subscribe((res: [GameInformation, GameEvents]) => {
      this.data.information = res[0];
      this.data.events = res[1];
      this.updateCanvas();
    });
  }

  ngOnChanges() {
    if (this.jsonGameData.information !== null) {
      this.data.information = this.dataService.processInfo(this.jsonGameData.information);
      this.data.events = this.data.events === null ? EMPTY_EVENTS : this.data.events;
    }
    if (this.jsonGameData.events !== null) {
      this.data.events = this.dataService.processEvents(this.jsonGameData.information, this.jsonGameData.events);
      this.data.information = this.data.information === null ? EMPTY_INFO : this.data.information;
    }
    this.updateCanvas();
  }

  updateCanvas() {
    this.barWidth = typeof this.size !== 'undefined' && this.size !== null ? this.size.width : SVG_CONFIG.width;
    this.barWidth *= 0.7;
    this.svgHeight = typeof this.size !== 'undefined' && this.size !== null ? this.size.height : SVG_CONFIG.height;
    this.svgWidth = typeof this.size !== 'undefined' && this.size !== null ? this.size.width : SVG_CONFIG.width;
    this.setup();
    this.drawBars();
    this.drawAxes();
    this.drawPlayers();
    this.buildCrosshair();
    this.addListeners();
    this.highlightSelectedPlayer();
  }

  /**
   * Initialize D3 scales and build SVG element
   */
  setup() {
    this.initializeScales();
    this.buildSVG();
  }

  /**
   * Initialize D3 scales for time/x axis and score/y axis.
   */
  initializeScales() {

    this.xScale = this.d3
      .scaleLinear()
      .range([0, this.barWidth])
      .domain([0, this.getMaximumTime()]);

    this.yScale = this.d3
      .scaleLinear()
      .range([SVG_CONFIG.height, 0])
      .domain([0, this.getMaximumAchievableScore()]);
  }

  /**
   * Adds main SVG element to the #container and assign it to svg property
   */
  buildSVG() {
    const container = this.d3.select('#container').html(''); // Clear the container
    this.svg = container
      .append('svg')
      .attr(
        'width',
        this.svgWidth + SVG_MARGIN_CONFIG.left + SVG_MARGIN_CONFIG.right
      )
      .attr(
        'height',
        this.svgHeight + SVG_MARGIN_CONFIG.top + SVG_MARGIN_CONFIG.bottom + 30
      )
      .append('g')
      .attr(
        'transform',
        'translate(' +
          SVG_MARGIN_CONFIG.left +
          ',' +
          SVG_MARGIN_CONFIG.top +
          ')'
      );
  }

  /**
   * Draws average and maximum time bars
   */
  drawBars() {
    const barsGroup = this.svg.append('g').attr('class', 'score-final-bars');
    const barsData: BarVisualizationData = this.getBarsData();
    this.drawMaximumTimeBar(barsGroup, barsData);
    this.drawAverageTimeBar(barsGroup, barsData);
    this.drawBarLabel();
  }

  /**
   *
   * @param barsGroup D3 selection of group holding both bars
   * @param BarVisualizationData data holding maximum time
   */
  drawMaximumTimeBar(barsGroup, data: BarVisualizationData) {
    barsGroup
      .append('rect')
      .attr('class', 'score-final-bar-max')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.svgHeight)
      .attr('width', this.xScale(data.maxTime))
      .attr('fill', BAR_CONFIG.fillColorBright);
  }

  /**
   *
   * @param barsGroup D3 selection of group holding both bars
   * @param BarVisualizationData data holding average time
   */
  drawAverageTimeBar(barsGroup, data: BarVisualizationData) {
    barsGroup
      .append('rect')
      .attr('class', 'score-final-bar-avg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.svgHeight)
      .attr('width', this.xScale(data.avgTime))
      .attr('fill', BAR_CONFIG.fillColorDark);
  }

  /**
   * Draws label on the right of the bars
   */
  drawBarLabel() {
    this.drawLegend();
  }

  /**
   * Draws legend under bar label
   */
  drawLegend() {
    const x = 0.75 * this.svgWidth;
    const y = this.svgHeight * 0.15;
    const yOffset = 20;
    const labelOffset = 25;

    this.drawAverageTimeLegend({ x: x, y: y }, labelOffset);
    this.drawMaximumTimeLegend({ x: x, y: y + yOffset }, labelOffset);

    if (this.feedbackLearnerId != null) {
      this.drawOtherPlayersLegend({x: x, y: y + yOffset * 2}, labelOffset);
      this.drawFeedbackLearnerLegend({x: x, y: y + yOffset * 3}, labelOffset);
    }
  }

  drawAverageTimeLegend(coordinates: { x: number; y: number }, labelOffset) {
    const rect = this.svg
      .append('rect')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', 'rgb(140, 140, 140)');
    const label = this.svg
      .append('text')
      .attr('x', coordinates.x + labelOffset)
      .attr('y', coordinates.y + 9.5)
      .html('Average time');
  }

  drawMaximumTimeLegend(coordinates: { x: number; y: number }, labelOffset) {
    const maximumTime = this.svg
      .append('rect')
      .attr('x', coordinates.x)
      .attr('y', coordinates.y)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', '#D6D6D6');
    const maximumLabel = this.svg
      .append('text')
      .attr('x', coordinates.x + labelOffset)
      .attr('y', coordinates.y + 9.5)
      .html('Maximum time');
  }

  drawOtherPlayersLegend(coordinates: { x: number; y: number }, labelOffset) {
    const otherPlayers = this.svg
      .append('circle')
      .attr('cx', coordinates.x + PLAYER_POINT_CONFIG.pointRadius)
      .attr('cy', coordinates.y + PLAYER_POINT_CONFIG.pointRadius)
      .attr('r', PLAYER_POINT_CONFIG.pointRadius)
      .style('fill', PLAYER_POINT_CONFIG.fillColor);
    const otherPlayersLabel = this.svg
      .append('text')
      .attr('x', coordinates.x + labelOffset)
      .attr('y', coordinates.y + 9.5)
      .html('Other players');
  }

  drawFeedbackLearnerLegend(
    coordinates: { x: number; y: number },
    labelOffset
  ) {
    const feedbackLearner = this.svg
      .append('circle')
      .attr('cx', coordinates.x + PLAYER_POINT_CONFIG.pointRadius + 1)
      .attr(
        'cy',
        coordinates.y + PLAYER_POINT_CONFIG.feedbackLearner.pointRadius / 1.5
      )
      .attr('r', PLAYER_POINT_CONFIG.feedbackLearner.pointRadius)
      .style('fill', PLAYER_POINT_CONFIG.fillColor);
    const feedbackLearnerLabel = this.svg
      .append('text')
      .attr('x', coordinates.x + labelOffset)
      .attr('y', coordinates.y + 9.5)
      .html('You');
  }

  /**
   * Draw time/x axis and score/y axis
   */
  drawAxes() {
    this.drawTimeAxis();
    this.drawScoreAxis();
  }

  /**
   * Draws time/x axis, ticks every 30 minutes
   * @param timeScale D3 time scale of domain
   */
  drawTimeAxis() {
    const timeScale = this.getTimeScale();
    const d3 = this.d3;
    const xAxis = d3
      .axisBottom(timeScale)
      .tickArguments([d3.timeMinute.every(this.tickLength)])
      .tickFormat((d: Date) => d3.timeFormat('%H:%M:%S')(d))
      .tickSize(AXES_CONFIG.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        `translate(${AXES_CONFIG.xAxis.position.x}, ${
          SVG_CONFIG.height + 20
        })`
      )
      .call(xAxis);

    this.drawTimeAxisLabel();
    this.styleFirstTickOfTimeAxis();
  }

  /**
   * Initialize time scale of range [0, this.barWidth] and domain [0, maximum game time]
   * @returns D3 ScaleTime
   */
  getTimeScale(): any {
    const scaleDomainStart = new Date(0, 0, 0, 0, 0, 0, 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, this.getMaximumTime(), 0);
    const fullTimeAxis = Math.abs(scaleDomainEnd.getTime() - scaleDomainStart.getTime() ) / 1000;

    while ((fullTimeAxis / this.tickLength) > 600 ) {
      this.tickLength *= (this.tickLength === 1 || this.tickLength > 160) ? 5 : 2;
    }

    const timeScale = this.d3
      .scaleTime()
      .range([0, this.barWidth])
      .domain([scaleDomainStart, scaleDomainEnd]);
    return timeScale;
  }

  /**
   * Draws time axis label
   */
  drawTimeAxisLabel() {
    this.svg
      .append('text')
      .attr(
        'transform',
        `translate(${this.barWidth / 2 - 50}, ${this.svgHeight + 75})`
      )
      .style('fill', '#4c4a4a')
      .text('game time');
      /*.style('font-weight', 'bold');*/
  }

  /**
   * Removes the line tick and adds circle instead on the first tick of time axis
   */
  styleFirstTickOfTimeAxis() {
    this.svg.select('.x-axis>.tick>line').remove();
    this.svg
      .select('.x-axis>.tick')
      .append('circle')
      .attr('r', 3.5)
      .style('fill', '#888888');
  }

  /**
   * Draws score with single tick, the 0-tick is ignored by tickFormat
   */
  drawScoreAxis() {
    const axesConfig = AXES_CONFIG;
    const maximumScore = this.getMaximumAchievableScore();
    const scoreScale = this.yScale;

    const yAxis = this.d3
      .axisLeft(scoreScale)
      .tickSize(axesConfig.yAxis.tickSize)
      .tickValues([0, maximumScore])
      .tickFormat(value => (value === 0 ? '' : value.toString()))
      .tickPadding(axesConfig.yAxis.tickPadding);

    this.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr(
        'transform',
        `translate(${axesConfig.yAxis.position.x}, ${
          axesConfig.yAxis.position.y
        })`
      )
      .call(yAxis);

    this.drawScoreAxisLabel();
  }

  drawScoreAxisLabel() {
    this.svg
      .append('text')
      .attr(
        'transform',
        `translate(${AXES_CONFIG.xAxis.position.x - 35}, ${this.svgHeight /
          2}) rotate(-90)`
      )
      .text('score')
      .attr('text-anchor', 'middle')
      .style('fill', '#4c4a4a');
  }

  /**
   * Draw players (circles) on the bar
   */
  drawPlayers() {
    const data: PlayerVisualizationData[] = this.getPlayersData();
    const playersGroup = this.svg
      .append('g')
      .attr('class', 'score-final-players');

    playersGroup
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr(
        'class',
        (playerData: PlayerVisualizationData) =>
          'player-point p' + playerData.id
      )
      .attr('id', (playerData: PlayerVisualizationData) => 'p' + playerData.id)
      .attr('cx', (playerData: PlayerVisualizationData) =>
        this.xScale(playerData.time)
      )
      .attr('cy', (playerData: PlayerVisualizationData) =>
        this.yScale(playerData.score)
      )
      .attr('r', (playerData: PlayerVisualizationData) =>
        playerData.id === this.feedbackLearnerId
          ? PLAYER_POINT_CONFIG.feedbackLearner.pointRadius
          : PLAYER_POINT_CONFIG.pointRadius
      )
      .style('fill', PLAYER_POINT_CONFIG.fillColor);
  }

  /**
   * Appends crosshair lines and its labels to the SVG and sets the opacity to 0
   */
  buildCrosshair() {
    const crosshairGroup = this.svg
      .append('g')
      .attr('class', 'focus-lines')
      .style('opacity', 0);

    const crosshairLabelsGroup = this.svg
      .append('g')
      .attr('class', 'focus-labels')
      .style('opacity', 0);

    this.buildScoreCrosshairLine(crosshairGroup);
    this.buildTimeCrosshairLine(crosshairGroup);
    this.buildCrosshairLabels(crosshairLabelsGroup);
  }

  /**
   * Appends score crosshair line to the svg group
   * @param crosshairGroup D3 selection of svg group holding crosshair lines
   */
  buildScoreCrosshairLine(crosshairGroup) {
    crosshairGroup
      .append('line')
      .attr('id', 'focus-line-score')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none'); // Prevents events triggering when interacting with parent element
  }

  /**
   * Appends time crosshair line to the svg group
   * @param crosshairGroup D3 selection of svg group holding crosshair lines
   */
  buildTimeCrosshairLine(crosshairGroup) {
    crosshairGroup
      .append('line')
      .attr('id', 'focus-line-time')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none');
  }

  /**
   * Appends text svg element to the svg group
   * @param crosshairLabelsGroup D3 selection of svg group holding crosshair lines labels
   */
  buildCrosshairLabels(crosshairLabelsGroup) {
    crosshairLabelsGroup
      .append('text')
      .attr('id', 'focus-label-score')
      .attr('class', 'focus-label');

    crosshairLabelsGroup
      .append('text')
      .attr('id', 'focus-label-time')
      .attr('class', 'focus-label');
  }

  /**
   * Adds event listeners to players and bars
   */
  addListeners() {
    this.addListenersToPlayers();
    this.addListenersToBars();
  }

  /**
   * Adds hover and click events listeners to players
   */
  addListenersToPlayers() {
    this.svg
      .selectAll('.player-point')
      .on('mouseover', this.onPlayerMouseover.bind(this))
      .on('mousemove', this.onPlayerMousemove.bind(this))
      .on('mouseout', this.onPlayerMouseout.bind(this))
      .on('click', this.onPlayerClick.bind(this));
  }

  /**
   * Highlights _ALL_ player's points (also in Score Level Component) and shows tooltip
   * @param player data held by player's <circle> element in __data__
   */
  onPlayerMouseover(player: PlayerVisualizationData) {
    this.hideTooltip(); // Prevents showing multiple tooltips
    this.highlightHoveredPlayer(player);
    this.showTooltip(player);
    this.showCrosshair();
    if (this.playerClicked === false) {
      this.outputSelectedPlayerId.emit(player.id);
    }

    const noEventServiceWasPassed =
      typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringFinalOnPlayerMouseover(player);
    }
  }

  /**
   * Makes the <circle> bigger
   * @param player data held by player's <circle> element in __data__
   */
  highlightHoveredPlayer(player: PlayerVisualizationData) {
    const players = this.d3.selectAll('.player-point.p' + player.id);
    const isFeedbackLearner = player.id === this.feedbackLearnerId;
    const radius = isFeedbackLearner
      ? PLAYER_POINT_CONFIG.feedbackLearner.pointRadius
      : PLAYER_POINT_CONFIG.pointRadius;
    const magnifier = isFeedbackLearner
      ? 1.05
      : PLAYER_POINT_CONFIG.pointHighlight;
    const newRadius = radius * magnifier;

    players
      .attr('r', newRadius)
      .style('cursor', 'pointer')
      .classed('player-point-highlighted', true)
      .classed('player-point', false);
  }

  /**
   * Shows tooltip with player's name and score
   * @param player data held by player's <circle> element in __data__
   */
  showTooltip(player: PlayerVisualizationData) {
    const playerTooltip = this.d3
      .select('body')
      .append('div')
      .attr('class', 'player-tooltip')
      .style('opacity', 0);

    playerTooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);

    const coordinates = this.d3.mouse(<ContainerElement>(
      this.d3.select('.score-final-bars').node()
    ));
    const yOffset = coordinates[1] > 55 ? -50 : 10;

    const x = this.d3.event.pageX + 10;
    const y = this.d3.event.pageY + yOffset;

    playerTooltip
      .html(`<p><b>${
        (this.feedbackLearnerId === undefined || this.feedbackLearnerId === null) ? 'Player ID: ' + player.id : (
          this.feedbackLearnerId === player.id ? 'you' : 'other player'
        )
        } <br> Score: ${player.score}</b>`)
      .style('left', x + 'px')
      .style('top', y + 'px');
  }

  /**
   * Sets crosshair groups opacity to 1
   */
  showCrosshair() {
    this.svg.select('.focus-lines').style('opacity', 1);
    this.svg.select('.focus-labels').style('opacity', 1);
  }

  /**
   * Show crosshair at fixed position (center of circle).
   * @param player data held by player's <circle> element in __data__
   * @param index of current circle
   * @param nodeList of all <circle> elements
   */
  onPlayerMousemove(player: PlayerVisualizationData, index, nodeList) {
    const d3 = this.d3;
    const crosshairLinesGroup = d3.select('.focus-lines');
    const crosshairLabelsGroup = d3.select('.focus-labels');

    const playerElementNode = nodeList[index];

    const groups = {
      lines: crosshairLinesGroup,
      labels: crosshairLabelsGroup
    };

    const playersData = {
      x: playerElementNode.getAttribute('cx'),
      y: playerElementNode.getAttribute('cy'),
      time: d3.timeFormat('%H:%M:%S')(new Date(0, 0, 0, 0, 0, player.time, 0)),
      score: player.score
    };

    this.updateCrosshair(groups, playersData);

    const noEventServiceWasPassed =
      typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringFinalOnPlayerMousemove(player);
    }
  }

  /**
   * Update crosshair position and label values
   */
  updateCrosshair(
    groups: { lines: any; labels: any },
    playersData: { x: number; y: number; time: string; score: number }
  ) {
    this.updateScoreCrosshair(groups, playersData);
    this.updateTimeCrosshair(groups, playersData);
  }

  /**
   * Updates score crosshair line position and its label's value
   * @param groups reference to svg groups of crosshair lines and labels
   * @param playersData holding crosshair's position and values
   */
  updateScoreCrosshair(
    groups: { lines: any; labels: any },
    playersData: { x: number; y: number; time: string; score: number }
  ) {
    const crosshairConfig = CROSSHAIR_CONFIG;
    groups.lines
      .select('#focus-line-score')
      .attr('x1', playersData.x)
      .attr('y1', crosshairConfig.score.line.y1)
      .attr('x2', playersData.x)
      .attr('y2', this.svgHeight + 30);

    groups.labels
      .select('#focus-label-score')
      .attr('x', crosshairConfig.score.label.x)
      .attr('y', +playersData.y + crosshairConfig.score.label.y)
      .text(playersData.score);
  }

  /**
   * Updates time crosshair line position and its label's value
   * @param groups reference to svg groups of crosshair lines and labels
   * @param playersData holding crosshair's position and values
   */
  updateTimeCrosshair(
    groups: { lines: any; labels: any },
    playersData: { x: number; y: number; time: string; score: number }
  ) {
    const crosshairConfig = CROSSHAIR_CONFIG;
    groups.lines
      .select('#focus-line-time')
      .attr('x1', crosshairConfig.time.line.x1)
      .attr('y1', playersData.y)
      .attr('x2', this.barWidth + 10)
      .attr('y2', playersData.y);

    groups.labels
      .select('#focus-label-time')
      .attr('x', +playersData.x + crosshairConfig.time.label.x)
      .attr('y', this.svgHeight + 15)
      .text(playersData.time);
  }

  /**
   * Unhighlights the hovered player, hides tooltip and crosshair on mouseout event
   * @param player data held by <circle> element in __data__ property
   */
  onPlayerMouseout(player: PlayerVisualizationData) {
    this.unhighlightHoveredPlayer(player);
    this.hideTooltip();
    this.hideCrosshair();
    if (this.playerClicked === false) {
      this.outputSelectedPlayerId.emit(); // Unhiglight with fade
    }

    const noEventServiceWasPassed =
      typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringFinalOnPlayerMouseout(player);
    }
  }

  /**
   *
   * @param player data held by <circle> element in __data__ property
   */
  unhighlightHoveredPlayer(player: PlayerVisualizationData) {
    const players = this.d3.selectAll(
      '.player-point-highlighted.p' + player.id
    );
    const isFeedbackLearner = player.id === this.feedbackLearnerId;
    const radius = isFeedbackLearner
      ? PLAYER_POINT_CONFIG.feedbackLearner.pointRadius
      : PLAYER_POINT_CONFIG.pointRadius;
    players
      .attr('r', radius)
      .classed('player-point-highlighted', false)
      .classed('player-point', true);
  }

  /**
   * Removes player tooltip element from DOM
   */
  hideTooltip() {
    this.d3.selectAll('.player-tooltip').remove();
  }

  /**
   * Sets crosshair's opacity to 0
   */
  hideCrosshair() {
    this.d3.select('.focus-lines').style('opacity', 0);
    this.d3.select('.focus-labels').style('opacity', 0);
  }

  /**
   * Emit selection to parent component for highlight in other component
   * @param player data held by <circle> element in __data__ property
   */
  onPlayerClick(player: PlayerVisualizationData) {
    this.d3.event.stopPropagation();
    this.outputSelectedPlayerId.emit(player.id);
    this.playerClicked = true;

    const noEventServiceWasPassed =
      typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringFinalOnPlayerClick(player);
    }
  }

  /**
   * Adds hover and click event listeners to bars
   */
  addListenersToBars() {
    this.svg
      .select('.score-final-bars')
      .on('mouseover', this.onBarMouseover.bind(this))
      .on('mousemove', this.onBarMousemove.bind(this))
      .on('mouseout', this.onBarMouseout.bind(this));

    this.d3.select('#container').on('click', this.onContainerClick.bind(this));
  }

  /**
   * Shows crosshair while hovering over bar
   */
  onBarMouseover() {
    this.showCrosshair();
  }

  /**
   * Updates crosshair position and values
   */
  onBarMousemove() {
    const d3 = this.d3;
    const crosshairConfig = CROSSHAIR_CONFIG;
    const crosshairLinesGroup = d3.select('.focus-lines');
    const crosshairLabelsGroup = d3.select('.focus-labels');
    const coordinates = this.d3.mouse(<ContainerElement>(
      this.d3.select('.score-final-bars').node()
    ));
    this.yScale.clamp(true);

    const groups = {
      lines: crosshairLinesGroup,
      labels: crosshairLabelsGroup
    };

    const xScale = this.d3
      .scaleLinear()
      .range([0, this.barWidth])
      .domain([0, this.getMaximumTime()]);

    xScale.clamp(true);

    const playersData = {
      x: coordinates[0],
      y: coordinates[1],
      time: d3.timeFormat('%H:%M:%S')(
        new Date(0, 0, 0, 0, 0, xScale.invert(coordinates[0]), 0)
      ),
      score: +this.yScale.invert(coordinates[1]).toFixed(0)
    };

    this.updateCrosshair(groups, playersData);
  }

  /**
   * Hides crosshair when cursor leaves the bar
   */
  onBarMouseout() {
    this.hideCrosshair();
  }

  /**
   * Cancel player selection by clicking anywhere in the container except players
   */
  onContainerClick() {
    this.outputSelectedPlayerId.emit();
    this.playerClicked = false;
  }

  /**
   * Set player's circles in Score Level and Score Final components to bigger radius and fill color
   */
  highlightSelectedPlayer() {
    if (!this.inputSelectedPlayerId) { return; }

    this.svg.selectAll('.player-point').style('opacity', 0.5);

    const player = this.svg
      .selectAll('.p' + this.inputSelectedPlayerId)
      .classed('player-point', false)
      .classed('player-point-selected', true)
      .transition()
      .duration(1500)
      .ease(this.d3.easeElasticOut)
      .style('opacity', 1)
      .style('fill', (data, index, nodeList) => {
        const color = this.d3.hsl(nodeList[index].style.fill);
        return color.darker(1.5);
      });

    if (this.inputSelectedPlayerId === this.feedbackLearnerId) { return; }

    player.attr(
      'r',
      PLAYER_POINT_CONFIG.pointRadius * PLAYER_POINT_CONFIG.pointHighlight * 1.1
    );
  }

  /**
   * @returns game's maximum achievable score
   */
  getMaximumAchievableScore(): number {
    return this.visualizationService.getScoreFinalGameMaxScore(this.data);
  }

  /**
   * @returns maximum value of players' game time
   */
  getMaximumTime(): number {
    return this.visualizationService.getScoreFinalMaxTime(this.data);
  }

  /**
   * @returns PlayerVisualizationData processed players' data for visualization
   */
  getPlayersData(): PlayerVisualizationData[] {
    return this.visualizationService.getScoreFinalPlayersData(this.data);
  }

  /**
   * @returns BarVisualizationData processed data for visualizing bars
   */
  getBarsData(): BarVisualizationData {
    return this.visualizationService.getScoreFinalBarsData(this.data);
  }
}
