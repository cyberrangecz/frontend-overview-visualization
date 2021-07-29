import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {
  AXES_CONFIG,
  BARS_CONFIG,
  colorScheme,
  CROSSHAIR_CONFIG,
  LEVEL_LABELS_CONFIG,
  PLAYER_POINT_CONFIG,
  SVG_CONFIG,
  SVG_MARGIN_CONFIG,
} from './config';
import { ContainerElement, D3, D3Service, ScaleBand, ScaleLinear } from '@muni-kypo-crp/d3-service';
import { ClusteringLevelsEventService } from '../interfaces/clustering-levels-event-service';
import { SvgConfig } from '../../../../shared/interfaces/configurations/svg-config';
import { Kypo2TraineeModeInfo } from '../../../../shared/interfaces/kypo2-trainee-mode-info';
import { take } from 'rxjs/operators';
import { ClusteringTrainingData } from '../../../model/clustering/clustering-training-data';
import { LevelTypeEnum } from '../../../model/clustering/enums/level-type.enum';
import { Level } from '../../../model/clustering/level';
import { ClusteringService } from '../shared/service/clustering.service';
import { PlayerLevelData } from '../../../model/clustering/player-level-data';

@Component({
  selector: 'kypo2-viz-overview-levels',
  templateUrl: './levels.component.html',
  styleUrls: ['./levels.component.css'],
})
export class LevelsComponent implements OnInit, OnChanges {
  /**
   * Training data
   */
  @Input() levelsData: ClusteringTrainingData = { finalResults: null, levels: null };
  /**
   * JSON data to use instead of data from API
   */
  @Input() jsonLevels: ClusteringTrainingData = { finalResults: null, levels: null };

  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
  /**
   * Player to highlight
   */
  @Input() inputSelectedPlayerId: string;
  /**
   * Id of player
   */
  @Input() feedbackLearnerId: string;
  /**
   * Service containing event handlers which are invoked whenever the visualization's events are fired.
   */
  @Input() eventService: ClusteringLevelsEventService;
  /**
   * Main svg dimensions.
   */
  @Input() size: SvgConfig;
  /**
   * Array of color strings for visualization.
   */
  @Input() colorScheme: string[];
  /**
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;
  /**
   * Emits id of selected player.
   */
  @Output() outputSelectedPlayerId = new EventEmitter<number>();

  private d3: D3;
  private xScale: ScaleLinear<number, number>;
  private yScaleBandBars: ScaleBand<string>;
  private svg;

  private svgWidth;
  private svgHeight;
  private barWidth;
  private tickLength = 1;

  private playerClicked = false; // If no player is selected, hover out of player will cancel the highlight

  constructor(d3: D3Service, private dataService: ClusteringService) {
    this.d3 = d3.getD3();
  }

  ngOnInit() {
    if (!this.useLocalMock) {
      this.load();
    }
  }

  ngOnChanges() {
    if (this.jsonLevels !== undefined && this.jsonLevels.finalResults !== null) {
      this.levelsData.finalResults = this.jsonLevels.finalResults;
    }
    if (this.jsonLevels !== undefined && this.jsonLevels.levels !== null) {
      this.levelsData.levels = this.jsonLevels.levels;
    }
    if (this.levelsData.levels) {
      this.updateCanvas();
    }
  }

  load() {
    this.dataService
      .getAllData(this.traineeModeInfo)
      .pipe(take(1))
      .subscribe((res) => {
        this.levelsData = res;
        this.updateCanvas();
      });
  }

  updateCanvas() {
    this.svgHeight = typeof this.size !== 'undefined' && this.size !== null ? this.size.height : SVG_CONFIG.height;
    this.svgWidth = typeof this.size !== 'undefined' && this.size !== null ? this.size.width : SVG_CONFIG.width;
    this.barWidth = 0.7 * this.svgWidth;
    this.setup();
    this.drawBars();
    this.drawAxes();
    this.drawPlayers();
    this.buildCrosshair();
    this.addListeners();
    this.highlightSelectedPlayer();
  }

  /**
   * Initialize scales
   */
  setup() {
    this.initializeScales();
    this.buildSVG();
  }

  /**
   * Initialize global D3 scales
   */
  initializeScales() {
    this.xScale = this.d3.scaleLinear().range([0, this.barWidth]).domain([0, this.getMaxTime()]);
  }

  /**
   * Appends main SVG element to the #score-level-container and assigns it to the class svg property
   */
  buildSVG() {
    const container = this.d3.select('#score-level-container').html('');
    this.svg = container
      .append('svg')
      .attr('width', this.svgWidth + SVG_MARGIN_CONFIG.left + SVG_MARGIN_CONFIG.right)
      .attr('height', this.svgHeight + SVG_MARGIN_CONFIG.top + SVG_MARGIN_CONFIG.bottom + 20)
      .append('g')
      .attr('transform', 'translate(' + SVG_MARGIN_CONFIG.left + ',' + SVG_MARGIN_CONFIG.top + ')');
  }

  /**
   * Draws each level bars
   */
  drawBars() {
    const barsGroup = this.svg.append('g').attr('id', 'score-level-bars');
    const data: Level[] = this.getTrainingLevels();
    this.initializeScaleBand(data);
    this.drawMaximumBars(barsGroup, data);
    this.drawAverageBars(barsGroup, data);
    this.drawBarLabels();
  }

  /**
   * Initialize D3 ScaleBand and assign it to global property
   */
  initializeScaleBand(data: Level[]) {
    this.yScaleBandBars = this.d3
      .scaleBand()
      .range([0, this.svgHeight]) // [this.svgConfig.height, 0] results with reversed order
      .domain(data.map((d) => d.order.toString()))
      .padding(BARS_CONFIG.padding);
  }

  /**
   *
   * @param barsGroup d3 selection of group holding each bar
   * @param data holding necessary values for bar visualization
   */
  drawMaximumBars(barsGroup, data: Level[]) {
    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
    barsGroup
      .selectAll('.score-level-bar-max')
      .data(data)
      .enter()
      .append('rect')
      .attr('id', (level: Level) => 'score-level-bar-max-' + level.order)
      .attr('class', 'score-level-bar score-level-bar-max')
      .attr('x', 0)
      .attr('y', (level: Level) => this.yScaleBandBars(level.order.toString()))
      .attr('height', this.yScaleBandBars.bandwidth())
      .attr('width', (level: Level) => this.xScale(level.maxParticipantTime))
      .style('fill', (d, i) => colorScale(i))
      .style('opacity', BARS_CONFIG.maxBarOpacity);
  }

  /**
   * Draw average bars overlaying the maximum bars with darker color
   * @param barsGroup d3 selection of group holding each bar
   * @param data holding necessary values for bar visualization
   */
  drawAverageBars(barsGroup, data: Level[]) {
    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
    barsGroup
      .selectAll('.score-level-bar-avg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'score-level-bar score-level-bar-avg')
      .attr('x', 0)
      .attr('y', (level: Level) => this.yScaleBandBars(level.order.toString()))
      .attr('height', this.yScaleBandBars.bandwidth())
      .attr('width', (level: Level) => this.xScale(level.averageTime))
      .style('fill', (d, i) => colorScale(i));
  }

  /**
   * Draw bar labels (Level number and name) next to the maximum bars
   */
  drawBarLabels() {
    if (this.levelsData == null) {
      return;
    }
    this.levelsData.levels.forEach((level) => {
      // we only show training levels in this visualization
      if (level.levelType === LevelTypeEnum.TrainingLevel) {
        const bar = this.d3.select('#score-level-bar-max-' + level.order);
        const barWidth = bar.attr('width');
        const barY = bar.attr('y');
        const text = this.svg
          .append('g')
          .attr(
            'transform',
            `translate(
           ${+barWidth + LEVEL_LABELS_CONFIG.padding.left},
           ${+barY + LEVEL_LABELS_CONFIG.padding.top})`
          )
          .append('text');

        text.append('tspan').attr('dy', '1.3em').attr('x', 0).text(`Level ${level.order}`);

        text.append('tspan').attr('dy', '1.3em').attr('x', 0).text(level.title);
      }
    });
  }

  /**
   * Draw time axis, dashed left axis and score axis for each level
   */
  drawAxes() {
    this.drawTimeAxis();
    this.drawDashedLeftAxis();
    this.drawScoreAxes();
  }

  /**
   * Draw time x axis, ticks every 5 minutes
   */
  drawTimeAxis() {
    const d3 = this.d3;
    const timeScale = this.getTimeScale();
    const xAxis = d3
      .axisBottom(timeScale)
      .tickArguments([d3.timeMinute.every(this.tickLength)])
      .tickFormat((d: Date) => d3.timeFormat('%H:%M:%S')(d))
      .tickSize(AXES_CONFIG.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${AXES_CONFIG.xAxis.position.x}, ${this.svgHeight + 0.3 * 0.3})`)
      .call(xAxis);
    this.drawTimeAxisLabel();
    this.styleFirstTickOfTimeAxis();
  }

  /**
   * @returns D3 TimeScale of x-axis
   */
  getTimeScale(): any {
    const scaleDomainStart = new Date(0, 0, 0, 0, 0, 0, 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, this.getMaxTime(), 0);
    const fullTimeAxis = Math.abs(scaleDomainEnd.getTime() - scaleDomainStart.getTime()) / 1000;

    while (fullTimeAxis / this.tickLength > 600) {
      this.tickLength *= this.tickLength === 1 || this.tickLength > 160 ? 5 : 2;
    }

    const timeScale = this.d3.scaleTime().range([0, this.barWidth]).domain([scaleDomainStart, scaleDomainEnd]);
    return timeScale;
  }

  /**
   * Draws time axis label
   */
  drawTimeAxisLabel() {
    this.svg
      .append('text')
      .attr('transform', `translate(${this.barWidth / 2 - 50}, ${this.svgHeight + 60})`)
      .text('time per level')
      .style('fill', '#4c4a4a');
  }

  /**
   * Removes the line tick and adds circle instead on the first tick of time axis
   */
  styleFirstTickOfTimeAxis() {
    this.svg.select('.x-axis>.tick').append('circle').attr('r', 3.5).style('fill', '#888888');
  }

  /**
   * Draws dashed left axis underneath score axis
   */
  drawDashedLeftAxis() {
    this.svg
      .append('g')
      .attr('class', 'y-axis-nolabel')
      .attr('transform', `translate(${AXES_CONFIG.yAxis.position.x}, ${AXES_CONFIG.yAxis.position.y})`)
      .append('path')
      .attr('d', `M0,${this.svgHeight - SVG_MARGIN_CONFIG.bottom * 0.3}.5V0.5H0`);
  }

  /**
   * Draw score axis for each level
   */
  drawScoreAxes() {
    const d3 = this.d3;
    const trainingLevels =
      this.levelsData !== null
        ? this.levelsData.levels.filter((level) => level.levelType === LevelTypeEnum.TrainingLevel)
        : [];
    d3.selectAll('.score-level-bar-max').each((bar) => {
      const yScale = d3
        .scaleLinear()
        .range([this.yScaleBandBars.bandwidth(), 0])
        .domain([0, trainingLevels[bar['order'] - 1].maxParticipantScore]);
      const yAxis = d3
        .axisLeft(yScale)
        .tickSize(AXES_CONFIG.yAxis.tickSize)
        .tickValues([0, trainingLevels[bar['order'] - 1].maxParticipantScore])
        .tickPadding(AXES_CONFIG.yAxis.tickPadding)
        .tickFormat((d) => (d === 0 ? '' : d.toString()));
      const barY = d3.select('#score-level-bar-max-' + bar['order']).attr('y');

      this.svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${AXES_CONFIG.yAxis.position.x}, ${barY})`)
        .call(yAxis);

      this.d3.selectAll('.y-axis>.tick>text').attr('y', AXES_CONFIG.yAxis.tickPositionY);
    });

    this.drawScoreAxesLabel();
  }

  drawScoreAxesLabel() {
    this.svg
      .append('text')
      .attr('transform', `translate(${AXES_CONFIG.yAxis.position.x - 50}, ${this.svgHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .style('fill', '#4c4a4a')
      .text('score');
  }

  /**
   * Draw players (circles) on each level bar indicating each level training time and achieved score
   */
  drawPlayers() {
    const yScaleBand = this.yScaleBandBars;
    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
    const levels = this.getTrainingLevels();
    levels.forEach((level, i) => {
      this.drawPlayersOnSingleBar(level.playerLevelData, i, colorScale);
    });
  }

  /**
   * Draw players on current level bar
   * @param players in current level
   * @param i number of level
   * @param colorScale color of level
   */
  drawPlayersOnSingleBar(players: PlayerLevelData[], i: number, colorScale) {
    const pointConfig = PLAYER_POINT_CONFIG;
    const levelNumber = i + 1;
    const barCoordinateY = this.yScaleBandBars(levelNumber.toString());
    const barHeight = barCoordinateY + this.yScaleBandBars.bandwidth();
    const trainingLevels = this.levelsData !== null ? this.getTrainingLevels() : [];
    const yBarScale = this.d3
      .scaleLinear()
      .range([
        barHeight, // bottom coordinate
        barCoordinateY, // top coordinate (y values goes from top to bottom)
      ])
      .domain([0, trainingLevels[i].maxParticipantScore]);

    const playersGroup = this.svg.append('g').attr('class', 'score-level-players').datum({ number: levelNumber });

    const xScale = (this.xScale = this.d3.scaleLinear().range([0, this.barWidth]).domain([0, this.getMaxTime()]));
    playersGroup
      .selectAll('.player-point-level-' + i)
      .data(players)
      .enter()
      .append('circle')
      .attr('class', (d: PlayerLevelData) => 'player-point player-point-level-' + i + ' p' + d.trainingRunId)
      .attr('cx', (d: PlayerLevelData) => xScale(d.trainingTime))
      .attr('cy', (d: PlayerLevelData) => yBarScale(d.participantLevelScore))
      .attr('r', (d: PlayerLevelData) =>
        d.trainingRunId === Number(this.feedbackLearnerId) ? pointConfig.feedbackLearner.pointRadius : pointConfig.pointRadius
      )
      .style('fill', () => {
        const c = this.d3.hsl(colorScale(i.toString()).toString());
        return c.darker(0.6);
      });
  }

  /**
   * Appends crosshair lines and its labels to the SVG and sets the opacity to 0
   */
  buildCrosshair() {
    const crosshairGroup = this.svg.append('g').attr('class', 'focus-lines').style('opacity', 0);

    const crosshairLabelsGroup = this.svg.append('g').attr('class', 'focus-labels').style('opacity', 0);

    this.buildScoreCrosshairLine(crosshairGroup);
    this.buildTimeCrosshairLine(crosshairGroup);
    this.buildCrosshairLabels(crosshairLabelsGroup);
  }

  buildScoreCrosshairLine(crosshairGroup) {
    crosshairGroup
      .append('line')
      .attr('id', 'focus-line-score')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none'); // Prevents events triggering when interacting with parent element
  }

  buildTimeCrosshairLine(crosshairGroup) {
    crosshairGroup
      .append('line')
      .attr('id', 'focus-line-time')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none');
  }

  buildCrosshairLabels(crosshairLabelsGroup) {
    crosshairLabelsGroup.append('text').attr('id', 'focus-label-score').attr('class', 'focus-label');

    crosshairLabelsGroup.append('text').attr('id', 'focus-label-time').attr('class', 'focus-label');
  }

  /**
   * Add event listeners to players and bars
   */
  addListeners() {
    const svg = this.svg;

    svg
      .selectAll('.score-level-bar')
      .on('mouseover', this.onBarMouseover.bind(this))
      .on('mousemove', this.onBarMousemove.bind(this))
      .on('mouseout', this.onBarMouseout.bind(this));

    svg
      .selectAll('.player-point')
      .on('mouseover', this.onPlayerPointMouseover.bind(this))
      .on('mousemove', this.onPlayerPointMousemove.bind(this))
      .on('mouseout', this.onPlayerPointMouseout.bind(this))
      .on('click', this.onPlayerPointClick.bind(this));

    this.d3.select('#score-level-container').on('click', this.onContainerClick.bind(this));
  }

  onBarMouseover() {
    this.showCrosshair();
  }

  showCrosshair() {
    this.svg.select('.focus-lines').style('opacity', 1);
    this.svg.select('.focus-labels').style('opacity', 1);
  }

  /**
   *
   * @param barData
   */
  onBarMousemove(barData: Level) {
    const d3 = this.d3;
    const crosshairLinesGroup = this.svg.select('.focus-lines');
    const crosshairLabelsGroup = this.svg.select('.focus-labels');
    const bar = this.svg.select('#score-level-bar-max-' + barData.order);
    const coordinates = d3.mouse(bar.node());
    const x = coordinates[0];
    const y = coordinates[1];
    const trainingLevels =
      this.levelsData !== null
        ? this.levelsData.levels.filter((level) => level.levelType === LevelTypeEnum.TrainingLevel)
        : [];
    const xScale = this.d3.scaleLinear().range([0, this.barWidth]).domain([0, this.getMaxTime()]);
    xScale.clamp(true);
    const yScale = d3
      .scaleLinear()
      .range([0, trainingLevels[barData.order - 1].maxParticipantScore])
      .domain([this.yScaleBandBars.bandwidth(), 0]);
    yScale.clamp(true);

    const groups = {
      lines: crosshairLinesGroup,
      labels: crosshairLabelsGroup,
    };

    const playersData = {
      x: x,
      y: y,
      time: d3.timeFormat('%H:%M:%S')(new Date(0, 0, 0, 0, 0, xScale.invert(x), 0)),
      score: +yScale(y - bar.attr('y')).toFixed(0),
    };

    this.updateCrosshair(groups, playersData);
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
      .attr('y2', crosshairConfig.score.line.y2);

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
      .attr('x2', crosshairConfig.time.line.x2)
      .attr('y2', playersData.y);

    groups.labels
      .select('#focus-label-time')
      .attr('x', +playersData.x + crosshairConfig.time.label.x)
      .attr('y', crosshairConfig.time.label.y)
      .text(playersData.time);
  }

  /**
   * Hide crosshair when cursor leaves any bar
   */
  onBarMouseout() {
    this.hideCrosshair();
  }

  /**
   * Sets crosshair's opacity to 0
   */
  hideCrosshair() {
    this.svg.select('.focus-lines').style('opacity', 0);
    this.svg.select('.focus-labels').style('opacity', 0);
  }

  /**
   * Cancels player selection when clicked everywhere inside the container
   */
  onContainerClick() {
    this.outputSelectedPlayerId.emit();
    this.playerClicked = false;
  }

  /**
   * Highlights player, shows tooltip and crosshair on hover
   * @param player
   */
  onPlayerPointMouseover(player: PlayerLevelData) {
    this.hideTooltip(); // Prevents showing multiple tooltips
    this.highlightHoveredPlayer(player);
    this.showTooltip(player);
    this.showCrosshair();
    if (this.playerClicked === false) {
      this.outputSelectedPlayerId.emit(player.trainingRunId);
    }
    const noEventServiceWasPassed = typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringLevelsOnPlayerMouseover(player);
    }
  }

  /**
   * Makes the <circle> bigger
   * @param player data held by player's <circle> element in __data__
   */
  highlightHoveredPlayer(player: PlayerLevelData) {
    const players = this.d3.selectAll('.player-point.p' + player.trainingRunId);
    const isFeedbackLearner = player.trainingRunId === Number(this.feedbackLearnerId);
    const radius = isFeedbackLearner
      ? PLAYER_POINT_CONFIG.feedbackLearner.pointRadius
      : PLAYER_POINT_CONFIG.pointRadius;
    const magnifier = isFeedbackLearner ? 1.05 : PLAYER_POINT_CONFIG.pointHighlight;
    const newRadius = radius * magnifier;

    players
      .attr('r', newRadius)
      .style('cursor', 'pointer')
      .classed('player-point-highlighted', true)
      .classed('player-point', false);
  }

  /**
   *
   * @param player data held by <circle> element in __data__ property
   */
  showTooltip(player: PlayerLevelData) {
    const playerTooltip = this.d3.select('body').append('div').attr('class', 'player-tooltip').style('opacity', 0);

    playerTooltip.transition().duration(200).style('opacity', 0.9);

    const coordinates = this.d3.mouse(<ContainerElement>this.d3.select('#score-level-bars').node());
    const groupHeight = this.yScaleBandBars.step() * this.levelsData.levels.length + SVG_MARGIN_CONFIG.top;
    const yOffset = groupHeight - coordinates[1] < 60 ? -50 : 10;

    playerTooltip
      .html(`<p><b>Player: ${player.name} <br> Score: ${player.participantLevelScore}</b>`)
      .style('left', this.d3.event.pageX + 10 + 'px')
      .style('top', this.d3.event.pageY + yOffset + 'px');
  }

  /**
   * Show crosshair at fixed position (center of circle).
   * @param player data held by player's <circle> element in __data__
   * @param index of current circle
   * @param nodeList of all <circle> elements
   */
  onPlayerPointMousemove(player, index, nodeList) {
    const d3 = this.d3;
    const playerElementNode = nodeList[index];
    const playersGroup = playerElementNode.parentNode;
    const level = d3.select(playersGroup).datum()['order'];
    const trainingLevels =
      this.levelsData !== null
        ? this.levelsData.levels.filter((trainingLevel) => trainingLevel.levelType === LevelTypeEnum.TrainingLevel)
        : [];
    const yScale = d3
      .scaleLinear()
      .range([0, trainingLevels[level - 1].maxParticipantScore])
      .domain([this.yScaleBandBars.bandwidth(), 0]);
    yScale.clamp(true);
    const x = playerElementNode.getAttribute('cx');
    const y = playerElementNode.getAttribute('cy');
    const crosshairLinesGroup = this.svg.select('.focus-lines');
    const crosshairLabelsGroup = this.svg.select('.focus-labels');
    yScale.clamp(true);

    const groups = {
      lines: crosshairLinesGroup,
      labels: crosshairLabelsGroup,
    };

    const playersData = {
      x: x,
      y: y,
      time: d3.timeFormat('%H:%M:%S')(new Date(0, 0, 0, 0, 0, player.time, 0)),
      score: player.score.toFixed(0),
    };

    this.updateCrosshair(groups, playersData);
    const noEventServiceWasPassed = typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringLevelsOnPlayerMousemove(player);
    }
  }

  /**
   * Unhighlights the hovered player, hides tooltip and crosshair on mouseout event
   * @param player data held by <circle> element in __data__ property
   */
  onPlayerPointMouseout(player: PlayerLevelData) {
    this.unhighlightHoveredPlayer(player);
    this.hideTooltip();
    this.hideCrosshair();
    if (this.playerClicked === false) {
      this.outputSelectedPlayerId.emit();
    }
    const noEventServiceWasPassed = typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringLevelsOnPlayerMouseout(player);
    }
  }

  /**
   *
   * @param player data held by <circle> element in __data__ property
   */
  unhighlightHoveredPlayer(player: PlayerLevelData) {
    const players = this.d3.selectAll('.player-point-highlighted.p' + player.trainingRunId);
    const isFeedbackLearner = player.trainingRunId === Number(this.feedbackLearnerId);
    const radius = isFeedbackLearner
      ? PLAYER_POINT_CONFIG.feedbackLearner.pointRadius
      : PLAYER_POINT_CONFIG.pointRadius;
    players.attr('r', radius).classed('player-point-highlighted', false).classed('player-point', true);
  }

  /**
   * Removes player tooltip element from DOM
   */
  hideTooltip() {
    this.d3.selectAll('.player-tooltip').remove();
  }

  /**
   * Emit selection to parent component for highlight in other component
   * @param player data held by <circle> element in __data__ property
   */
  onPlayerPointClick(player: PlayerLevelData) {
    this.d3.event.stopPropagation();
    this.outputSelectedPlayerId.emit(player.trainingRunId);
    this.playerClicked = true;
    const noEventServiceWasPassed = typeof this.eventService === 'undefined' || this.eventService === null;
    if (!noEventServiceWasPassed) {
      this.eventService.clusteringLevelsOnPlayerClick(player);
    }
  }

  /**
   * Set player's circles in Score Level and Score Final components to bigger radius and fill color
   */
  highlightSelectedPlayer() {
    this.hideTooltip(); // Prevents showing the tooltip when user quickly leaves the viz
    if (!this.inputSelectedPlayerId) {
      return;
    }

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

    if (this.inputSelectedPlayerId === this.feedbackLearnerId) {
      return;
    }

    player.attr('r', PLAYER_POINT_CONFIG.pointRadius * PLAYER_POINT_CONFIG.pointHighlight * 1.1);
  }

  /**
   * @returns data for bar drawing
   */
  getTrainingLevels(): Level[] {
    const levels = this.levelsData.levels.filter((level) => level.levelType === LevelTypeEnum.TrainingLevel);
    levels.forEach((level, i) => {
      level.order = ++i;
    });
    return levels;
  }

  private getMaxTime(): number {
    const levels = this.levelsData.levels.filter((level) => level.levelType === LevelTypeEnum.TrainingLevel);
    let maxTime = 0;
    levels.forEach((level, i) => {
      maxTime = level.maxParticipantTime > maxTime ? level.maxParticipantTime : maxTime;
    });
    return maxTime;
  }
}
