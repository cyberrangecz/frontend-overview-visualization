import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {GameData} from '../../../shared/interfaces/game-data';
import {D3, D3Service} from 'd3-ng2-service';
import {DataProcessor} from '../../../services/data-processor.service';
import {Axis, BrushBehavior, Line, ScaleLinear, ScaleOrdinal, ScaleTime, ZoomBehavior} from 'd3-ng2-service/src/bundle-d3';
import {ProgressPlayer} from '../interfaces/progress-player';
import {ScoredEvent} from '../interfaces/scored-event';
import {AXES_CONFIG, colorScheme, CONTEXT_CONFIG, SVG_MARGIN_CONFIG} from './config';
import {SvgConfig} from '../../../shared/interfaces/configurations/svg-config';
import {SvgMarginConfig} from '../../../shared/interfaces/configurations/svg-margin-config';
import {TableService} from '../../../services/table.service';
import {Subscription} from 'rxjs';
import {FiltersService} from '../../../services/filters.service';
import {DataService} from '../../../services/data.service';
import {GameInformation} from '../../../shared/interfaces/game-information';
import {GameEvents} from '../../../shared/interfaces/game-events';
import {GenericEvent} from '../../../shared/interfaces/generic-event.enum';

@Component({
  selector: 'kypo2-viz-overview-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent implements OnInit, OnDestroy, OnChanges {

  @Input() data: GameData;
  @Input() feedbackLearnerId: string;
  @Input() colorScheme: string[];
  @Input() size: {width: number; height: number};

  players: ProgressPlayer[] = [];

  public svgConfig: SvgConfig;
  public svgMarginConfig: SvgMarginConfig;
  public playerColorScale: ScaleOrdinal<string, any>;
  public filters;
  public filtersArray;
  private clip;
  private timeAxisScale: ScaleTime<number, number>;
  private d3: D3;
  private svg;
  private timeScale: ScaleLinear<number, number>;
  private contextTimeScale: ScaleLinear<number, number>;
  private contextScoreScale: ScaleLinear<number, number>;
  private scoreScale: ScaleLinear<number, number>;
  private eventsColorScale: ScaleOrdinal<string, any>;
  private lineGenerator: Line<ScoredEvent>;
  private contextLineGenerator: Line<ScoredEvent>;
  private xAxis: Axis<any>;
  private zoom: ZoomBehavior<any, any>;
  private brush: BrushBehavior<any>;
  private playersGroup;
  private eventTooltip;
  private lineTooltip;
  private zoomableArea;

  private tableRowClicked: Subscription;
  private tableRowMouseover: Subscription;
  private tableRowMouseout: Subscription;
  private filterChanged: Subscription;

  constructor(
      d3service: D3Service,
      private visualizationService: DataProcessor,
      private tableService: TableService,
      private filtersService: FiltersService,
      private dataService: DataService
    ) {
    this.d3 = d3service.getD3();
    this.tableRowClicked = this.tableService.tableRowClicked$.subscribe(
      (player: ProgressPlayer) => {
        this.onRowClicked(player);
    });
    this.tableRowMouseover = this.tableService.tableRowMouseover$.subscribe(
      (id: any) => {
        this.highlightLine(id);
      }
    );
    this.tableRowMouseout = this.tableService.tableRowMouseout$.subscribe(
      (id: any) => {
        this.unhighlightLine(id);
      }
    );
    this.filterChanged = this.filtersService.filterChanged$.subscribe(
      () => {
        this.onFilterChange();
      }
    );
  }

  ngOnDestroy() {
    this.tableRowClicked.unsubscribe();
    this.tableRowMouseover.unsubscribe();
    this.tableRowMouseout.unsubscribe();
  }

  ngOnInit() {
    this.load();
  }

  ngOnChanges() {
    this.players = this.getPlayersWithEvents();
    this.redraw();
  }

  load() {
    this.dataService.getAllData().subscribe((res: [GameInformation, GameEvents]) => {
      this.data.information = res[0];
      this.data.events = res[1];

      this.players = this.getPlayersWithEvents();
      this.redraw();
    });
  }

  redraw() {
    this.setup();
    this.initializeFilters();
    this.drawFeedbackLearner();
    this.initializeScales();
    this.drawEstimatedTimesBars();
    this.drawAxes();
    this.drawLevelThresholds();
    this.addZoomableArea();
    this.buildSvgDefs();
    this.buildPlayersGroup();
    this.buildTooltips();
    this.addZoomAndBrush();
    this.buildCrosshair();
    this.drawLegend();
  }

  /**
   * Assign imported filters from ./filters
   */
  initializeFilters() {
    this.filters = this.filtersService.getFiltersObject();
    this.filtersArray = this.filtersService.getFiltersArray();
  }

  /**
   * Draws feedback learner on default
   */
  drawFeedbackLearner(): void {
    this.checkFeedbackLearner();
    if (this.feedbackLearnerId !== null) {this.drawPlayer(this.feedbackLearnerId); }
  }
  /**
   * Sets checked attribute of feedback learner in players array to true
   */
  checkFeedbackLearner() {
    if (this.players === null) { return null; }
    this.players = this.players.map(player => {
      if (player.id === this.feedbackLearnerId) { player.checked = true; }
      return player;
    });
  }

  /**
   * Builds svg, initializes line generator, zoom & behavior and scales
   */
  setup() {
    this.svgConfig = {width: this.size.width, height: this.size.height};
    this.svgMarginConfig = SVG_MARGIN_CONFIG;
    this.buildSVG();
    this.initializeLineGenerators();
    this.initializeZoomAndBrush();
    this.initializeScales();
  }

  /**
   * Appends main SVG element to the #score-level-container and assigns it to the class svg property
   */
  buildSVG() {
    const container = this.d3.select('#score-progress-container').html('');
    this.svg = container.append('svg')
      .attr('class', 'score-progress-svg')
      .attr('width', this.size.width + SVG_MARGIN_CONFIG.left + SVG_MARGIN_CONFIG.right)
      .attr('height', this.size.height + SVG_MARGIN_CONFIG.top + SVG_MARGIN_CONFIG.bottom)
      .append('g')
      .attr('transform', 'translate(' + SVG_MARGIN_CONFIG.left + ',' + SVG_MARGIN_CONFIG.top + ')');
  }

  /**
   * Define line generator and its accessors for progress lines generating
   */
  initializeLineGenerators() {
    this.lineGenerator = this.d3.line<ScoredEvent>()
      .x(event => +this.timeScale(event.time).toFixed(0))
      .y(event => +this.scoreScale(event.score).toFixed(0));

    this.contextLineGenerator = this.d3.line<ScoredEvent>()
      .x(event => +this.contextTimeScale(event.time).toFixed(0))
      .y(event => +this.contextScoreScale(event.score).toFixed(0));
  }

  /**
   * Define zoom and brush behavior
   */
  initializeZoomAndBrush() {
    this.zoom = this.d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.size.width, this.size.height]])
      .extent([[0, 0], [this.size.width, this.size.height]])
      .on('start', this.onZoomStart.bind(this))
      .on('zoom', this.onZoom.bind(this))
      .on('end', this.onZoomEnd.bind(this));

    this.brush = this.d3.brushX()
      .extent([[0, 0], [this.size.width, 70]])
      .on('start', this.onBrushStart.bind(this))
      .on('brush', this.onBrush.bind(this))
      .on('end', this.onBrushEnd.bind(this));
  }

  /**
   * Change cursor to grab and shrink clip to prevent showing events outside the area
   */
  onZoomStart() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'mousedown') { // Panning start
      this.zoomableArea.classed('grabbed', true);
      this.clip.attr('x', 3);
    }
  }

  /**
   * Main zoom and pan behavior
   */
  onZoom() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'brush') { return; } // ignore brush-by-zoom (causes stack overflow)
    const events = this.playersGroup.selectAll('circle') // Hide if out of area
      .style('opacity', function () {
        return (this.cx.animVal.value < 0) ? 0 : 1;
      });
    const transform = this.d3.event.transform;
    const newDomain = transform.rescaleX(this.contextTimeScale).domain();
    this.timeScale.domain(newDomain);
    const scaleDomainStart = new Date(0, 0, 0, 0, 0, newDomain[0], 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, newDomain[1], 0);
    this.timeAxisScale.domain([scaleDomainStart, scaleDomainEnd]);

    this.redrawAxes(transform.k);
    this.redrawPlayers();
    this.redrawBars(transform);
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type !== 'dbclick') {
      this.updateCrosshair();
    }
    this.svg.select('.brush')
      .call(this.brush.move, this.timeScale.range().map(transform.invertX, transform));
  }

  /**
   * Change cursor and clip to normal.
   */
  onZoomEnd() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'mouseup') { // Panning end
      this.zoomableArea.classed('grabbed', false);
      this.clip.attr('x', -7);
    }
  }

  /**
   * Change cursor to grab
   */
  onBrushStart() {
    this.svg.select('.brush>.selection')
      .attr('cursor', null)
      .classed('grabbed', true);
  }

  /**
   * Main brush behavior.
   */
  onBrush() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'zoom') { return; } // ignore zoom-by-brush (causes stack overflow)
    const selection = this.d3.event.selection || this.contextTimeScale;
    const newDomain = selection.map(this.contextTimeScale.invert, this.contextTimeScale);
    this.timeScale.domain(newDomain);

    const scaleDomainStart = new Date(0, 0, 0, 0, 0, newDomain[0], 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, newDomain[1], 0);
    this.timeAxisScale.domain([scaleDomainStart, scaleDomainEnd]);

    const transform = this.d3.zoomIdentity
      .scale(this.size.width / (selection[1] - selection[0]))
      .translate(-selection[0], 0);

    this.redrawAxes(transform.k);
    this.redrawPlayers();
    this.redrawBars(transform);
    this.svg.select('.score-progress-zoom')
      .call(this.zoom.transform, transform);
  }

  /**
   * Change cursor back to normal.
   */
  onBrushEnd() {
    this.svg.select('.brush>.selection')
      .classed('grabbed', false);
  }

  /**
   * Define D3 scales
   */
  initializeScales() {
    this.playerColorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
    this.tableService.sendPlayerColorScale(this.playerColorScale);

    const scaleDomainStart = new Date(0, 0, 0, 0, 0, 0, 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, this.getMaximumTime(true), 0);
    this.timeAxisScale = this.d3.scaleTime()
      .range([0, this.size.width])
      .domain([scaleDomainStart, scaleDomainEnd]);

    this.scoreScale = this.d3.scaleLinear()
      .range([this.size.height, 0])
      .domain([0, this.getMaximumScore()]);

    this.scoreScale.clamp(true);

    this.timeScale = this.d3.scaleLinear()
      .range([0, this.size.width])
      .domain([0, this.getMaximumTime(true)]);

    this.contextTimeScale = this.d3.scaleLinear()
      .range([0, this.size.width])
      .domain([0, this.getMaximumTime(true)]);

    this.contextScoreScale = this.d3.scaleLinear()
      .range([CONTEXT_CONFIG.height, 0])
      .domain([0, this.getMaximumScore()]);

    this.eventsColorScale = this.d3.scaleOrdinal()
      .range(this.colorScheme  || colorScheme);
  }

  /**
   * Draw color hatched time bars indicating estimated game time
   */
  drawEstimatedTimesBars() {
    if (this.data.information === null) { return; }
    const estimatedTimes = this.data.information.levels.map(level => {
      return { type: level.type, number: level.number, time: level.estimatedTime, offset: 0 };
    });

    for (let i = 1; i < estimatedTimes.length; i++) {
      const level = estimatedTimes[i];
      level['offset'] = estimatedTimes[i - 1].offset + estimatedTimes[i - 1].time;
    }

    const colorScale = this.d3.scaleOrdinal()
      .range(this.colorScheme  || colorScheme);

    const barsGroup = this.svg.append('g')
      .attr('class', 'score-progress-bars')
      .style('mask', 'url(#mask)');

    barsGroup.selectAll('rect')
      .data(estimatedTimes)
      .enter()
      .append('rect')
      .attr('x', level => this.timeScale(level.offset))
      .attr('y', 0)
      .attr('width', level => this.timeScale(level.time))
      .attr('height', this.size.height)
      .style('fill', level => {
        if (level.type !== 'GAME_LEVEL') {
          return 'lightgray';
        }
        return colorScale(level.number.toString());
      })
      .style('opacity', 1);
  }

  /**
   * Draw time axis, score axis and add labels
   */
  drawAxes() {
    this.drawTimeAxis();
    this.drawScoreAxis();
    this.drawAxesLabels();
  }

  /**
   * Draw time x axis with ticks every 30 minutes
   */
  drawTimeAxis() {
    const d3 = this.d3;
    this.xAxis = d3.axisBottom(this.timeAxisScale)
      .tickArguments([d3.timeMinute.every(30)])
      .tickFormat((d: Date) => d3.timeFormat('%H:%M:%S')(d))
      .tickSize(AXES_CONFIG.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg.append('g')
      .attr('class', 'score-progress x-axis')
      .attr('transform', `translate(${AXES_CONFIG.xAxis.position.x}, ${this.size.height + 20})`)
      .call(this.xAxis);
  }

  /**
   * Draw score y axis, ticks accumulated/summed maximum gainable score for each levels completed
   */
  drawScoreAxis() {
    if (this.data.information === null) { return; }
    const axesConfig = AXES_CONFIG;
    const tickValues = this.data.information.levels
      .filter( level =>  (level.type === 'GAME_LEVEL'))
      .map(level => [level.points])
      .reduce((accumulator, currentValue, i) => accumulator.concat(accumulator[i - 1] + currentValue[0]));

    const yAxis = this.d3.axisLeft(this.scoreScale)
      .tickValues(tickValues)
      .tickSize(axesConfig.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg.append('g')
      .attr('class', 'score-progress y-axis')
      .attr('transform', `translate(${axesConfig.yAxis.position.x}, ${axesConfig.yAxis.position.y})`)
      .call(yAxis);
  }

  /**
   * Draws axes labels
   */
  drawAxesLabels() {
    const scores = this.svg.select('.y-axis')
      .selectAll('.tick')
      .data();
    const scoresWithZero = [0].concat(scores);
    const coordinates = [];
    for (let i = 0; i < scoresWithZero.length - 1; i++) {
      const midScore = (scoresWithZero[i + 1] + scoresWithZero[i]) / 2;
      const coordinate = this.scoreScale(midScore);
      coordinates.push(coordinate);
    }

    const labelsGroup = this.svg.append('g').attr('class', 'score-progress-axis-labels');

    labelsGroup.selectAll('text')
      .data(coordinates)
      .enter()
      .append('text')
      .attr('class', 'score-progress-axis-label')
      .attr('transform', d => `translate(${-SVG_MARGIN_CONFIG.left * 0.8}, ${d})`)
      .html((d, i) => `Level ${i + 1}`);

    const colorScale = this.d3.scaleOrdinal()
      .range(this.colorScheme || colorScheme);

    labelsGroup.selectAll('rect')
      .data(coordinates)
      .enter()
      .append('rect')
      .attr('transform', d => `translate(${-SVG_MARGIN_CONFIG.left * 0.8 - 20}, ${d - 15})`)
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', (d, i) => colorScale(i.toString()));
  }

  /**
   * Draw horizontal lines indicating maximum gainable score for each levels completed
   */
  drawLevelThresholds() {
    const levelScores: number[] = this.svg
      .select('.y-axis')
      .selectAll('.tick')
      .data();
    const levelScoresWithoutLastLevel = levelScores.slice(0, levelScores.length - 1);
    const lineGenerator = this.d3.line();
    const thresholdsGroup = this.svg.append('g')
      .attr('class', 'score-progress-thresholds');

    thresholdsGroup.selectAll('path')
      .data(levelScoresWithoutLastLevel)
      .enter()
      .append('path')
      .attr('d', (score: number) => {
        const x1 = 0;
        const y1 = this.scoreScale(score);
        const x2 = this.size.width;
        const y2 = y1;
        return lineGenerator([[x1, y1], [x2, y2]]);
      });
  }

  /**
   * Appends rect with SVG dimensions, zoom behavior is called on this element
   */
  addZoomableArea() {
    this.zoomableArea = this.svg.append('rect')
      .attr('class', 'score-progress-zoom')
      .attr('width', this.size.width)
      .attr('height', this.size.height);
  }

  /**
   * Defines clip defs
   */
  buildSvgDefs() {
    this.clip = this.svg.append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.size.width + 20)
      .attr('height', this.size.height + 20)
      .attr('x', -7)
      .attr('y', -7);

    const lineClip = this.svg.append('defs')
      .append('svg:clipPath')
      .attr('id', 'lineClip')
      .append('svg:rect')
      .attr('width', this.size.width + 5)
      .attr('height', this.size.height)
      .attr('x', 3)
      .attr('y', 0);
  }

  /**
   * Appends SVG group for holding players
   */
  buildPlayersGroup() {
    this.playersGroup = this.svg.append('g')
      .attr('class', 'score-progress-players')
      .attr('clip-path', 'url(#clip)')
      .style('isolation', 'isolate');
  }

  /**
   * Appends tooltip HTML elements to DOM
   */
  buildTooltips() {
    this.eventTooltip = this.d3.select('body')
      .append('div')
      .style('display', 'none');

    this.lineTooltip = this.d3.select('body')
      .append('div')
      .style('display', 'none');
  }

  /**
   * Call brush and zoom behaviors predefiend elements (zoomableArea and context)
   */
  addZoomAndBrush() {
    this.addBrush();
    this.addZoom();
  }

  /**
   * Build context element to DOM and call brush behavior on it
   */
  addBrush() {
    const contextHeight = CONTEXT_CONFIG.height;
    const context = this.buildContextAndReturn();
    const brush = context.append('g')
      .attr('class', 'brush')
      .call(this.brush)
      .call(this.brush.move, this.timeScale.range());
  }

  /**
   * Appends context element to SVG and return it
   */
  buildContextAndReturn() {
    const context = this.svg.append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${AXES_CONFIG.xAxis.position.x}, ${this.size.height + CONTEXT_CONFIG.height})`);

    context.append('g')
      .attr('class', 'score-progress-context-x-axis')
      .attr('transform', `translate(0, ${CONTEXT_CONFIG.height})`)
      .call(this.xAxis);

    return context;
  }

  /**
   * Calls zoom behavior on zoomableArea/
   */
  addZoom() {
    this.zoomableArea.call(this.zoom);
  }

  /**
   * Append crosshair to SVG and sets opacity to 0
   */
  buildCrosshair() {
    const crosshairGroup = this.svg.append('g')
      .attr('class', 'score-progress-crosshair')
      .style('opacity', 0);

    this.buildTimeCrosshair(crosshairGroup);

    this.zoomableArea
      .on('mouseover', this.onAreaMouseover.bind(this))
      .on('mousemove', this.onAreaMousemove.bind(this))
      .on('mouseout', this.onAreaMouseout.bind(this));
  }

  /**
   * Appends time crosshair
   * @param crosshairGroup svg group holding crosshair
   */
  buildTimeCrosshair(crosshairGroup) {
    crosshairGroup.append('line')
      .attr('id', 'focus-line-time')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none'); // Prevents events triggering when interacting with parent element

    const crosshairLabelsGroup = crosshairGroup.append('g')
      .attr('class', 'focus-labels');

    crosshairLabelsGroup.append('text')
      .attr('id', 'focus-label-time')
      .attr('class', 'focus-label');
  }

  /**
   * Show crosshair whenever cursor enters the area
   */
  onAreaMouseover() {
    this.showCrosshair();
  }

  /**
   * @ignore
   */
  showCrosshair() {
    this.svg.select('.score-progress-crosshair').style('opacity', 1);
  }

  /**
   * Updates crosshair values and position
   */
  onAreaMousemove() {
    this.updateCrosshair();
  }

  /**
   * Updates crosshair's position and label values
   * @param staticCoordinates undefines if not passed otherwise static coordinates of hovered element (event) - for snapping
   */
  updateCrosshair(staticCoordinates?: [number, number]) {
    const d3 = this.d3;
    const focusLines = d3.select('.score-progress-crosshair');
    const focusLabels = d3.select('.score-progress-crosshair');
    const isStaticCoordinatesUsed = (staticCoordinates === undefined);
    const coords = isStaticCoordinatesUsed ? this.d3.mouse(this.zoomableArea.node()) : staticCoordinates;
    const x = coords[0];
    const y = coords[1];
    const time = d3.timeFormat('%H:%M:%S')(new Date(0, 0, 0, 0, 0, this.timeScale.invert(x), 0));
    // Vertical line - time
    focusLines.select('#focus-line-time')
      .attr('x1', +x)
      .attr('y1', -10)
      .attr('x2', +x)
      .attr('y2', this.size.height + 35);

    focusLabels.select('#focus-label-time')
      .attr('x', +x + 10)
      .attr('y', this.size.height + 15)
      .text(time);
  }

  /**
   * Hides crosshair whenever cursor leaves the zoomable area
   */
  onAreaMouseout() {
    this.hideCrosshair();
  }

  /**
   * @ignore
   */
  hideCrosshair() {
    this.svg.select('.score-progress-crosshair').style('opacity', 0);
  }

  /**
   * Draw legends to the right of the graph
   */
  drawLegend() {
    const x = 0;
    const y = -50;
    const legendGroup = this.svg
      .append('g')
      .attr('transform', 'translate(10, 0)');

    const rectWidth = 80;
    const rectHeight = 20;

    legendGroup.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('transform', `translate(${x}, ${y})`)
      .style('mask', 'url(#mask)')
      .style('fill', 'grey');

    legendGroup.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('transform', `translate(${x}, ${y})`)
      .style('stroke', 'black')
      .style('fill', 'none');

    legendGroup.append('text')
      .attr('transform', `translate(${x + rectWidth + 10}, ${y + rectHeight / 1.5 + 1})`)
      .html('Estimated time');
  }

  /**
   * Draws main line, events,
   * @param playerId of player to be drawn
   */
  drawPlayer(playerId: string) {
    const player: ProgressPlayer = this.players.filter(p => p.id === playerId)[0];
    const playerGroup = this.playersGroup.append('g')
      .attr('id', 'score-progress-player-' + player.id)
      .style('mix-blend-mode', 'multiply');

    this.drawMainLine(playerGroup, player);
    this.drawContextLine(player);

  }

  /**
   * Draws main line and events
   * @param playersGroup svg group holding main line and events
   * @param player holding id and events
   */
  drawMainLine(playersGroup, player) {
    const lineGroup = playersGroup
      .append('g')
      .attr('clip-path', 'url(#lineClip)');

    const line = lineGroup.append('path')
      .attr('d', this.lineGenerator(player.events))
      .attr('class', 'score-progress-player')
      .classed('score-progress-player-highlight', player.id === this.feedbackLearnerId)
      .classed('visible-line', true)
      .datum(player)
      .style('opacity', '0')
      .style('stroke', this.d3.hsl(this.playerColorScale(player.id.toString()).toString()).darker(0.7));

    line.transition()
      .duration(1000)
      .style('opacity', '100');

    const clickableLine = lineGroup.append('path')
      .attr('d', this.lineGenerator(player.events))
        .attr('class', 'score-progress-player')
      .datum(player)
      .style('fill', 'none')
      .style('stroke', 'transparent')
      .style('stroke-width', '15px');

    this.addListenersToLine(clickableLine);

    playersGroup.append('g')
      .attr('id', 'score-progress-events-' + player.id);
    this.drawPlayersEvents(player);

    return line;
  }
/*
  adjustTimes(events: ScoredEvent[]) {
    console.log(events);
    let delay = 0;
    events.forEach((event,i) => {
      if (event === this.typePrefix + 'TrainingRunResumed') {
        delay = event.time - events[i - 1].time;
      }
      events[i].time -= delay;
    });
    return events;
  }*/

  /**
   * @ignore
   */
  addListenersToLine(line) {
    line.on('mouseover', this.onLineMouseover.bind(this))
      .on('mousemove', this.onLineMousemove.bind(this))
      .on('mouseout', this.onLineMouseout.bind(this))
      .on('wheel', this.disableScrolling.bind(this));
  }

  /**
   * Highlights the line, show tooltip and crosshair
   * @param player
   */
  onLineMouseover(player: ProgressPlayer) {
    this.highlightLine(player.id);
    this.lineTooltip.style('display', 'inline');
    this.showCrosshair();
  }

  /**
   * @ignore
   */
  highlightLine(playerId: string) {
    const playerGroup = this.d3.select('#score-progress-player-' + playerId);
    const path = playerGroup.select('.visible-line');
    path.classed('score-progress-player-highlight', true);
  }

  /**
   * Update tooltip and crosshair
   */
  onLineMousemove(player: ProgressPlayer) {
    this.updateLineTooltip(player);
    this.updateCrosshair();
  }

  /**
   * Add player's name/id to tooltip and updates its position
   * @param player
   */
  updateLineTooltip(player) {
    const x: number = this.d3.event.pageX;
    const y: number = this.d3.event.pageY;
    const topMargin = -50;
    const top: number = y + topMargin;

    const content = `Player ID: <br> ${player.id.toString()}`;
    this.lineTooltip.attr('class', 'score-progress-line-tooltip')
      .style('left', (x - 5) + 'px')
      .style('top', top + 'px')
      .style('margin-left', -content.length / 4 + 'em');
    this.lineTooltip.html(content);
  }

  /**
   * Unhighlights the line, hides tooltip and crosshair
   * @param player
   */
  onLineMouseout(player: ProgressPlayer) {
    this.unhighlightLine(player.id);
    this.lineTooltip.style('display', 'none');
    this.hideCrosshair();
  }

  /**
   * @ignore
   */
  unhighlightLine(playerId: string) {
    if (playerId === this.feedbackLearnerId) { return; }
    const playerGroup = this.d3.select('#score-progress-player-' + playerId);
    const path = playerGroup.select('path');
    path.classed('score-progress-player-highlight', false);
  }

  /**
   * Draws line in a context bar
   * @param player holding its id and events
   */
  drawContextLine(player) {
    const contextLine = this.svg.select('.context')
      .append('path')
      .attr('d', this.contextLineGenerator(player.events))
      .attr('id', 'score-progress-context-player-' + player.id)
      .attr('class', 'score-progress-context-player')
      .style('opacity', '0')
      .style('stroke', this.d3.hsl(this.playerColorScale(player.id.toString()).toString()).darker(0.7));

    contextLine.transition()
      .duration(1000)
      .style('opacity', '100');
  }

  /**
   * Draws events onto main line
   * @param player
   */
  drawPlayersEvents(player: ProgressPlayer) {
    const colorScale = this.eventsColorScale;
    const eventsGroup = this.playersGroup
      .select('#score-progress-player-' + player.id)
      .select('#score-progress-events-' + player.id);

    const filteredEvents = this.filterEvents(player.events);

    let events = eventsGroup.selectAll('.event')
      .data(filteredEvents, (event) => event.time);
    this.removeFilteredEvents(events);

    events = this.addNewEventsAndReturnThem(events);
    events
      .attr('r', 7)
      .attr('cx', event => this.timeScale(event.time))
      .attr('cy', event => this.scoreScale(event.score))
      .style('opacity', '0')
      .style('fill', event => {
        if (event.gameLevel === undefined) { return 'lightgray'; }
        return this.d3.hsl(colorScale(event.gameLevel.toString()).toString()).darker(0.9);
      })
      .datum(event => { event.playerId = player.id; return event; })
      .style('stroke', 'black')
      .style('stroke-width', '0.5');

    this.drawInnerLevelUps(eventsGroup, filteredEvents, colorScale);
    this.addFadeInEffectTransition(events);
    this.addListenersToEvents(events);

  }

  /**
   * Filters elements with checked filters
   * @param unfilteredEvents to be filtered
   */
  filterEvents(unfilteredEvents: ScoredEvent[]) {
    let result: ScoredEvent[] = unfilteredEvents.filter(event => event.show); // Get rid of duplicates
    let delay = 0;
    Object.keys(this.filters).forEach(key => {
      const filter = this.filters[key];
      if (!filter.checked) {
        result = result.filter(filter.filterFunction);
      }
    });
/*
    result.forEach( (item,i) => {
      if (item.event === this.typePrefix + 'TrainingRunResumed') {
        delay = item.time - result[i - 1].time;
      }
      item.time -= delay;
    });*/

    return result;
  }

  /**
   * @ignore
   */
  removeFilteredEvents(events) {
    events.exit()
      .transition()
      .duration(200)
      .attr('r', 0)
      .remove();
  }

  /**
   * @ignore
   */
  addNewEventsAndReturnThem(events) {
    return events.enter()
      .append('circle')
      .attr('r', 0)
      .attr('class', 'event');
  }

  /**
   * @ignore
   */
  addFadeInEffectTransition(events) {
    const fadeInEffect = this.d3.transition()
      .duration(1000);

    events.transition(fadeInEffect)
      .style('opacity', '100');
  }

  addListenersToEvents(events) {
    events
      .on('mouseover', this.onEventMouseover.bind(this))
      .on('mousemove', this.onEventMousemove.bind(this))
      .on('mouseout', this.onEventMouseout.bind(this))
      .on('wheel', this.disableScrolling.bind(this));
  }

  /**
   * Draws small circles in correct flag submit events
   * @param eventsGroup
   * @param filteredEvents
   * @param colorScale
   */
  drawInnerLevelUps(eventsGroup, filteredEvents, colorScale) {
    let levelUpsInnerFill = eventsGroup.selectAll('.level-up')
      .data(filteredEvents, (event) => event.time);

    levelUpsInnerFill.exit().remove();

    levelUpsInnerFill = levelUpsInnerFill.enter()
      .filter((event) => event.event.toUpperCase().split(' ')[0] === 'CORRECT' && event.level !== this.data.information.levels.length)
      .append('circle')
      .attr('class', 'level-up')
      .attr('r', 4)
      .attr('cx', event => this.timeScale(event.time))
      .attr('cy', event => this.scoreScale(event.score))
      .style('fill', event => this.d3.hsl(colorScale((event.level + 1).toString()).toString()).darker(0.9))
      .style('stroke', 'black')
      .style('stroke-width', '0.2');
    this.addFadeInEffectTransition(levelUpsInnerFill);
    this.addListenersToEvents(levelUpsInnerFill);
  }

  /**
   * Shows tooltip and snaps crosshair.
   * @param player
   */
  onEventMouseover(player) {
    this.eventTooltip.style('display', 'inline');
    this.updateEventTooltip(player);
    this.highlightLine(player.playerId);
    this.showCrosshair();
  }

  /**
   * Updates tooltip details.
   * @param player
   */
  updateEventTooltip(player) {
    const topMargin = -75;
    const leftMargin = 8;
    const left = this.d3.event.pageX + leftMargin;
    const top = this.d3.event.pageY + topMargin;
    this.eventTooltip.attr('class', 'score-progress-tooltip')
      .style('left', left + 'px')
      .style('top', top + 'px');
    const event = this.getEventMessage(player);
    const content = `
    ${event}
    <br>
    <b>${player.scoreChange > 0 ? '+' : ''}${player.scoreChange !== 0 ? player.scoreChange : ''}</b>
    <hr style='margin: 5px'>
    Score: ${player.score}`;
    this.eventTooltip.html(content);
  }

  /**
   * Snaps crosshair on event
   * @param d
   * @param index
   * @param nodeList
   */
  onEventMousemove(d: ScoredEvent, index, nodeList) {
    const eventElement = nodeList[index];
    const x = eventElement.getAttribute('cx');
    const y = eventElement.getAttribute('cy');
    this.updateCrosshair([x, y]);
  }

  /**
   * Parses the event message and returns our required message.
   * @param event
   * @returns any
   */
  getEventMessage(event: ScoredEvent) {
    const cropped: string = event.event.split(GenericEvent.TypePrefix).pop();
    const croppedSpace = cropped.replace(/([A-Z])/g, ' $1').trim();

    switch (event.event) {
      case GenericEvent.TypePrefix + GenericEvent.LevelCompleted:
        if (event.gameLevel !== undefined) { return `Game level ${event.gameLevel} completed`; }
        return ` ${event.type.toLowerCase()} level completed`;
      case GenericEvent.TypePrefix + GenericEvent.LevelStarted:
        if (event.gameLevel !== undefined) { return `Game level ${event.gameLevel} started`; }
        return ` ${event.type.toLowerCase()} level started`;
      case (GenericEvent.TypePrefix + cropped):
        return croppedSpace;
      default:
        return event.event;
    }
  }

  /**
   * Hides tooltip, crosshair and highlight of the line
   * @param d
   */
  onEventMouseout(d) {
    this.eventTooltip.style('display', 'none');
    this.unhighlightLine(d.playerId);
    this.hideCrosshair();
  }

  /**
   * Disables scrolling when wheeling over events
   */
  disableScrolling() {
    this.d3.event.preventDefault();
  }

  /**
   * Removes player's line and events from the plane
   * @param playerId
   */
  removePlayer(playerId: string) {
    this.playersGroup.select('#score-progress-player-' + playerId).remove();
    this.svg.select('.context').select('#score-progress-context-player-' + playerId).remove();
  }

  /**
   * Calculate new ticks when zooming.
   */
  redrawAxes(k) {
    this.xAxis.tickArguments([this.d3.timeMinute.every(30 / Math.round(k))]);
    this.svg.select('.score-progress.x-axis').call(this.xAxis);
  }

  /**
   * Updates line length when zooming
   */
  redrawPlayers() {
    this.playersGroup.selectAll('.score-progress-player')
      .attr('d', d => this.lineGenerator(d.events));

    this.playersGroup.selectAll('circle').attr('cx', d => this.timeScale(d.time));
  }

  /**
   * Updates bar length when zooming
   * @param transform
   */
  redrawBars(transform) {
    this.svg.select('.score-progress-bars')
      .selectAll('rect')
      .attr('transform', `translate(${transform.x},0) scale(${transform.k}, 1)`);
  }

  /**
   *
   * @returns ProgressPlayer[] players' data for visualization.
   */
  getPlayersWithEvents(): ProgressPlayer[] {
    return this.visualizationService.getScoreProgressPlayersWithEvents(this.data);
  }

  /**
   *
   * @returns number longest game time.
   */
  getMaximumTime(includeTimeGaps: boolean = false) {
    return this.visualizationService.getScoreFinalMaxTime(this.data, includeTimeGaps);
  }

  /**
   *
   * @returns number highest achievable score.
   */
  getMaximumScore() {
    return this.visualizationService.getScoreFinalGameMaxScore(this.data);
  }

  /**
   * Activates filter.
   */
  onFilterChange() {
    const checkedPlayers = this.players.filter(player => player.checked);
    checkedPlayers.forEach(player => {
      this.drawPlayersEvents(player);
    });
  }

  /**
   * Draws or removes player from the plane when row in score table clicked.
   */
  onRowClicked(player) {
    const p = this.players.find((el) => el.id === player.id);
    p.checked = !p.checked;
    if (p.checked) {
      this.drawPlayer(p.id);
    } else {
      this.removePlayer(p.id);
    }
  }

  /**
   * Resets zoom to normal
   */
  onResetZoom() {
    this.svg.select('.score-progress-zoom')
    .transition()
    .duration(250)
    .call(this.zoom.transform, this.d3.zoomIdentity);
  }

  /**
   * Zooms in on button click
   */
  onButtonZoomIn() {
    const zoomElement = this.svg.select('.score-progress-zoom');
    this.zoom.scaleBy(zoomElement.transition().duration(250), 1.2);
  }

  /**
   * Zooms out on button click
   */
  onButtonZoomOut() {
    const zoomElement = this.svg.select('.score-progress-zoom');
    this.zoom.scaleBy(zoomElement.transition().duration(250), 0.8);
  }
}
