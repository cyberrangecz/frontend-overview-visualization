import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ConfigService } from '../../../../config/config.service';
import {
  D3,
  D3Service,
  Axis,
  BrushBehavior,
  Line,
  ScaleLinear,
  ScaleOrdinal,
  ScaleTime,
  ZoomBehavior,
} from '@muni-kypo-crp/d3-service';
import { AXES_CONFIG, colorScheme, CONTEXT_CONFIG, SVG_MARGIN_CONFIG } from './config';
import { SvgConfig } from '../../../../shared/interfaces/configurations/svg-config';
import { SvgMarginConfig } from '../../../../shared/interfaces/configurations/svg-margin-config';
import { TableService } from '../../../../services/table.service';
import { Subscription } from 'rxjs';
import { FiltersService } from '../../../../services/filters.service';
import { Kypo2TraineeModeInfo } from '../../../../shared/interfaces/kypo2-trainee-mode-info';
import { take } from 'rxjs/operators';
import { Timeline } from '../../../model/timeline/timeline';
import { TimelineService } from '../service/timeline.service';
import { TimelinePlayer } from '../../../model/timeline/timeline-player';
import { BasicLevelInfo, TimelineLevel } from '../../../model/timeline/timeline-level';
import { TrainingLevel } from '../../../model/timeline/training-level';
import TimelineLevelTypeEnum = BasicLevelInfo.TimelineLevelTypeEnum;
import { TimelineEvent } from '../../../model/timeline/timeline-event';
import { InfoLevel } from '../../../model/timeline/info-level';
import { AssessmentLevel } from '../../../model/timeline/assessment-level';

@Component({
  selector: 'kypo2-viz-overview-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Training data
   */
  @Input() timelineData: Timeline = { timeline: null };
  /**
   * JSON data to use instead of data from API
   */
  @Input() jsonlineData: Timeline = { timeline: null };
  /**
   * Flag to use local mock
   * @deprecated
   */
  @Input() useLocalMock = false;
  /**
   * Defines if all players should be displayed
   */
  @Input() enableAllPlayers = true;
  /**
   * Id of player
   */
  @Input() feedbackLearnerId: string;
  /**
   * Array of color strings for visualization.
   */
  @Input() colorScheme: string[];
  /**
   * Main svg dimensions.
   */
  @Input() size: { width: number; height: number };
  /**
   * Id of training definition
   */
  @Input() trainingDefinitionId: number;
  /**
   * Id of training instance
   */
  @Input() trainingInstanceId: number;
  /**
   * Id of training instance
   */
  @Input() trainingRunId: number;
  /**
   * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
   */
  @Input() traineeModeInfo: Kypo2TraineeModeInfo;
  /**
   * Emits boolean that indicates if table should be placed under the visualization
   */
  @Output() wideTable: EventEmitter<any> = new EventEmitter<any>();

  players: TimelinePlayer[] = [];

  public svgConfig: SvgConfig = { width: 0, height: 0 };
  public svgMarginConfig: SvgMarginConfig = { top: 0, bottom: 0, right: 0, left: 0 };
  public playerColorScale: ScaleOrdinal<string, any>;
  public filters;
  public filtersArray;
  public isLoading: boolean;
  private clip;
  private timeAxisScale: ScaleTime<number, number>;
  private d3: D3;
  private svg;
  private timeScale: ScaleLinear<number, number>;
  private contextTimeScale: ScaleLinear<number, number>;
  private contextScoreScale: ScaleLinear<number, number>;
  private scoreScale: ScaleLinear<number, number>;
  private eventsColorScale: ScaleOrdinal<string, any>;
  private lineGenerator: Line<TimelineEvent>;
  private contextLineGenerator: Line<TimelineEvent>;
  private xAxis: Axis<any>;
  private zoom: ZoomBehavior<any, any>;
  private brush: BrushBehavior<any>;
  private playersGroup;
  private eventTooltip;
  private lineTooltip;
  private zoomableArea;
  private tickLength = 1;

  private tableRowClicked: Subscription;
  private tableRowMouseover: Subscription;
  private tableRowMouseout: Subscription;
  private filterChanged: Subscription;

  constructor(
    d3service: D3Service,
    private tableService: TableService,
    private filtersService: FiltersService,
    private timelineService: TimelineService,
    private configService: ConfigService
  ) {
    this.d3 = d3service.getD3();
    this.tableRowClicked = this.tableService.tableRowClicked$.subscribe((player: TimelinePlayer) => {
      this.onRowClicked(player);
    });
    this.tableRowMouseover = this.tableService.tableRowMouseover$.subscribe((id: any) => {
      this.highlightLine(id);
    });
    this.tableRowMouseout = this.tableService.tableRowMouseout$.subscribe((id: any) => {
      this.unhighlightLine(id);
    });
    this.filterChanged = this.filtersService.filterChanged$.subscribe(() => {
      this.onFilterChange();
    });
  }

  ngOnDestroy() {
    this.tableRowClicked.unsubscribe();
    this.tableRowMouseover.unsubscribe();
    this.tableRowMouseout.unsubscribe();
  }

  ngOnInit() {
    if (!this.useLocalMock) {
      this.load();
    }
  }

  ngOnChanges() {
    if (this.jsonlineData !== null && this.jsonlineData.timeline !== null) {
      this.timelineData = this.jsonlineData;
    }
    this.configService.trainingDefinitionId = this.trainingDefinitionId;
    this.configService.trainingInstanceId = this.trainingInstanceId;
    this.configService.trainingRunId = this.trainingRunId;
    if (this.timelineData !== null && this.timelineData.timeline !== null) {
      this.players = this.timelineData.timeline.playerData;
      this.redraw();
    }
  }

  load() {
    this.isLoading = true;
      this.timelineService
        .getAllData(this.traineeModeInfo)
        .pipe(take(1))
        .subscribe((res) => {
          this.isLoading = false;
          this.timelineData = res;
          this.players = this.timelineData.timeline.playerData;
          this.redraw();
        });
  }

  redraw() {
    this.setup();
    this.initializeFilters();
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
    this.drawFeedbackLearner();
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
    if (this.feedbackLearnerId !== null) {
      this.drawPlayer(Number(this.feedbackLearnerId));
    }
  }
  /**
   * Sets checked attribute of feedback learner in players array to true
   */
  checkFeedbackLearner(): TimelinePlayer {
    if (this.players === null) {
      return null;
    }
    this.players = this.players.map((player) => {
      if (player.trainingRunId === Number(this.feedbackLearnerId)) {
        player.checked = true;
      }
      return player;
    });
  }

  /**
   * Builds svg, initializes line generator, zoom & behavior and scales
   */
  setup() {
    // first we want the table to fit in
    if (this.timelineData !== null && this.getLevels().filter((level) => level.order !== undefined).length <= 4) {
      this.size.width =
        window.innerWidth < 1400 && this.enableAllPlayers ? this.size.width * 0.55 : this.size.width * 0.7;
      this.wideTable.emit(false);
    } else {
      // we want to notify the timeline, that the table should be placed under the visualization
      this.wideTable.emit(true);
    }
    this.svgConfig = {
      width: this.size.width > window.innerWidth ? window.innerWidth : this.size.width,
      height: this.size.height,
    };
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
    this.svg = container
      .append('svg')
      .attr('class', 'score-progress-svg')
      .attr('width', this.size.width + SVG_MARGIN_CONFIG.left + SVG_MARGIN_CONFIG.right)
      .attr('height', this.size.height + SVG_MARGIN_CONFIG.top + SVG_MARGIN_CONFIG.bottom)
      .style('margin-right', '10px')
      .append('g')
      .attr('transform', 'translate(' + SVG_MARGIN_CONFIG.left + ',' + SVG_MARGIN_CONFIG.top + ')');
  }

  /**
   * Define line generator and its accessors for progress lines generating
   */
  initializeLineGenerators() {
    this.lineGenerator = this.d3
      .line<TimelineEvent>()
      .curve(this.d3.curveStepAfter)
      .x((event) => +this.timeScale(event.time).toFixed(0))
      .y((event) => +this.scoreScale(event.score).toFixed(0));

    this.contextLineGenerator = this.d3
      .line<TimelineEvent>()
      .curve(this.d3.curveStepAfter)
      .x((event) => +this.contextTimeScale(event.time).toFixed(0))
      .y((event) => +this.contextScoreScale(event.score).toFixed(0));
  }

  /**
   * Define zoom and brush behavior
   */
  initializeZoomAndBrush() {
    this.zoom = this.d3
      .zoom()
      .filter(() => {
        if (this.d3.event.ctrlKey) {
          this.d3.event.preventDefault();
        }
        if (this.d3.event.type === 'wheel') {
          // don't allow zooming without pressing [ctrl] key
          return this.d3.event.ctrlKey;
        }
        return true;
      })
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [this.size.width, this.size.height],
      ])
      .extent([
        [0, 0],
        [this.size.width, this.size.height],
      ])
      .on('start', this.onZoomStart.bind(this))
      .on('zoom', this.onZoom.bind(this))
      .on('end', this.onZoomEnd.bind(this));

    this.brush = this.d3
      .brushX()
      .extent([
        [0, 0],
        [this.size.width, 70],
      ])
      .on('start', this.onBrushStart.bind(this))
      .on('brush', this.onBrush.bind(this))
      .on('end', this.onBrushEnd.bind(this));
  }

  /**
   * Change cursor to grab and shrink clip to prevent showing events outside the area
   */
  onZoomStart() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'mousedown') {
      // Panning start
      this.zoomableArea.classed('grabbed', true);
      this.clip.attr('x', 3);
    }
  }

  /**
   * Main zoom and pan behavior
   */
  onZoom() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'brush') {
      return;
    } // ignore brush-by-zoom (causes stack overflow)
    const events = this.playersGroup
      .selectAll('circle') // Hide if out of area
      .style('opacity', function () {
        return this.cx.animVal.value < 0 ? 0 : 1;
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
    this.svg.select('.brush').call(this.brush.move, this.timeScale.range().map(transform.invertX, transform));
  }

  /**
   * Change cursor and clip to normal.
   */
  onZoomEnd() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'mouseup') {
      // Panning end
      this.zoomableArea.classed('grabbed', false);
      this.clip.attr('x', -7);
    }
  }

  /**
   * Change cursor to grab
   */
  onBrushStart() {
    this.svg.select('.brush>.selection').attr('cursor', null).classed('grabbed', true);
  }

  /**
   * Main brush behavior.
   */
  onBrush() {
    if (this.d3.event.sourceEvent && this.d3.event.sourceEvent.type === 'zoom') {
      return;
    } // ignore zoom-by-brush (causes stack overflow)
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
    this.svg.select('.score-progress-zoom').call(this.zoom.transform, transform);
  }

  /**
   * Change cursor back to normal.
   */
  onBrushEnd() {
    this.svg.select('.brush>.selection').classed('grabbed', false);
  }

  /**
   * We reserve 0.5 of the score domain to display the edges of the player lines correctly
   * Define D3 scales
   */
  initializeScales() {
    this.playerColorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
    this.tableService.sendPlayerColorScale(this.playerColorScale);

    const scaleDomainStart = new Date(0, 0, 0, 0, 0, 0, 0);
    const scaleDomainEnd = new Date(0, 0, 0, 0, 0, this.timelineData.timeline.maxParticipantTime, 0);

    const fullTimeAxis = Math.abs(scaleDomainEnd.getTime() - scaleDomainStart.getTime()) / 1000;

    while (fullTimeAxis / this.tickLength > 600) {
      this.tickLength *= this.tickLength === 1 || this.tickLength > 160 ? 5 : 2;
    }

    this.timeAxisScale = this.d3.scaleTime().range([0, this.size.width]).domain([scaleDomainStart, scaleDomainEnd]);

    this.scoreScale = this.d3
      .scaleLinear()
      .range([this.size.height, 0])
      .domain([-0.5, Math.max(...this.timelineData.timeline.maxScoreOfLevels) + 0.5]);

    this.scoreScale.clamp(true);

    this.timeScale = this.d3
      .scaleLinear()
      .range([0, this.size.width])
      .domain([0, this.timelineData.timeline.maxParticipantTime]);

    this.contextTimeScale = this.d3
      .scaleLinear()
      .range([0, this.size.width])
      .domain([0, this.timelineData.timeline.maxParticipantTime]);

    this.contextScoreScale = this.d3
      .scaleLinear()
      .range([CONTEXT_CONFIG.height, 0])
      .domain([-0.5, Math.max(...this.timelineData.timeline.maxScoreOfLevels) + 0.5]);

    this.eventsColorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);
  }

  /**
   * Draw color hatched time bars indicating estimated training time
   */
  drawEstimatedTimesBars() {
    if (this.timelineData.timeline === null) {
      return;
    }
    const estimatedTimes = this.getLevels().map((level) => {
      return { type: level.levelType, number: level.order, time: this.timelineData.timeline.estimatedTime, offset: 0 };
    });

    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);

    const barsGroup = this.svg.append('g').attr('class', 'score-progress-bars').style('mask', 'url(#mask)');

    barsGroup
      .selectAll('rect')
      .data(estimatedTimes)
      .enter()
      .append('rect')
      .attr('x', (level) => this.timeScale(level.offset))
      .attr('y', 0)
      .attr('width', (level) => this.timeScale(level.time))
      .attr('height', this.size.height)
      .style('fill', (level) => {
        if (level.type !== 'TRAINING_LEVEL') {
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
    this.xAxis = d3
      .axisBottom(this.timeAxisScale)
      .tickArguments([d3.timeMinute.every(this.tickLength)])
      .tickFormat((d: Date) => d3.timeFormat('%H:%M:%S')(d))
      .tickSize(AXES_CONFIG.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg
      .append('g')
      .attr('class', 'score-progress x-axis')
      .attr('transform', `translate(${AXES_CONFIG.xAxis.position.x}, ${this.size.height + 20})`)
      .call(this.xAxis);
  }

  /**
   * Draw score y axis, ticks accumulated/summed maximum gainable score for each levels completed
   */
  drawScoreAxis() {
    if (this.timelineData.timeline === null) {
      return;
    }
    const axesConfig = AXES_CONFIG;
    const yAxis = this.d3
      .axisLeft(this.scoreScale)
      .tickValues(this.timelineData.timeline.maxScoreOfLevels)
      .tickSize(axesConfig.xAxis.tickSize)
      .tickSizeOuter(0);

    this.svg
      .append('g')
      .attr('class', 'score-progress y-axis')
      .attr('transform', `translate(${axesConfig.yAxis.position.x}, ${axesConfig.yAxis.position.y})`)
      .call(yAxis);
  }

  /**
   * Draws axes labels
   */
  drawAxesLabels() {
    this.svg
      .append('text')
      .attr('transform', `translate(${this.svgConfig.width / 2 - 50}, ${this.svgConfig.height + 65})`)
      .text('training time')
      .style('fill', '#4c4a4a');

    this.svg
      .append('text')
      .attr('transform', `translate(${AXES_CONFIG.yAxis.position.x - 100}, ${this.svgConfig.height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .style('fill', '#4c4a4a')
      .text('score development'); // score increase per level

    const scores = this.svg.select('.y-axis').selectAll('.tick').data();
    const scoresWithZero = [0].concat(scores);
    const coordinates = [];
    for (let i = 0; i < scoresWithZero.length - 1; i++) {
      const midScore = (scoresWithZero[i + 1] + scoresWithZero[i]) / 2;
      const coordinate = this.scoreScale(midScore);
      coordinates.push(coordinate);
    }

    const labelsGroup = this.svg.append('g').attr('class', 'score-progress-axis-labels');

    labelsGroup
      .selectAll('text')
      .data(coordinates)
      .enter()
      .append('text')
      .attr('class', 'score-progress-axis-label')
      .attr('transform', (d) => `translate(${-SVG_MARGIN_CONFIG.left * 0.55}, ${d})`)
      .html((d, i) => `Level ${i + 1}`);

    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);

    labelsGroup
      .selectAll('rect')
      .data(coordinates)
      .enter()
      .append('rect')
      .attr('transform', (d) => `translate(${-SVG_MARGIN_CONFIG.left * 0.55 - 20}, ${d - 15})`)
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', (d, i) => colorScale(i.toString()));
  }

  /**
   * Draw horizontal lines indicating maximum gainable score for each levels completed
   */
  drawLevelThresholds() {
    const levelScores: number[] = this.svg.select('.y-axis').selectAll('.tick').data();
    const levelScoresWithoutLastLevel = levelScores.slice(0, levelScores.length - 1);
    const lineGenerator = this.d3.line();
    const thresholdsGroup = this.svg.append('g').attr('class', 'score-progress-thresholds');

    thresholdsGroup
      .selectAll('path')
      .data(levelScoresWithoutLastLevel)
      .enter()
      .append('path')
      .attr('d', (score: number) => {
        const x1 = 0;
        const y1 = this.scoreScale(score);
        const x2 = this.size.width;
        const y2 = y1;
        return lineGenerator([
          [x1, y1],
          [x2, y2],
        ]);
      });
  }

  /**
   * Appends rect with SVG dimensions, zoom behavior is called on this element
   */
  addZoomableArea() {
    this.zoomableArea = this.svg
      .append('rect')
      .attr('class', 'score-progress-zoom')
      .attr('width', this.size.width)
      .attr('height', this.size.height);
  }

  /**
   * Defines clip defs
   */
  buildSvgDefs() {
    this.clip = this.svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.size.width + 20)
      .attr('height', this.size.height + 20)
      .attr('x', -7)
      .attr('y', -7);

    const lineClip = this.svg
      .append('defs')
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
    this.playersGroup = this.svg
      .append('g')
      .attr('class', 'score-progress-players')
      .attr('clip-path', 'url(#clip)')
      .style('isolation', 'isolate');
  }

  /**
   * Appends tooltip HTML elements to DOM
   */
  buildTooltips() {
    this.eventTooltip = this.d3.select('body').append('div').style('display', 'none');

    this.lineTooltip = this.d3.select('body').append('div').style('display', 'none');
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
    const brush = context
      .append('g')
      .attr('class', 'brush')
      .attr('transform', `translate(0,10)`)
      .call(this.brush)
      .call(this.brush.move, this.timeScale.range());
  }

  /**
   * Appends context element to SVG and return it
   */
  buildContextAndReturn() {
    const context = this.svg
      .append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${AXES_CONFIG.xAxis.position.x}, ${this.size.height + CONTEXT_CONFIG.height})`);

    context
      .append('g')
      .attr('class', 'score-progress-context-x-axis')
      .attr('transform', `translate(0, ${CONTEXT_CONFIG.height + 10})`)
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
    const crosshairGroup = this.svg.append('g').attr('class', 'score-progress-crosshair').style('opacity', 0);

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
    crosshairGroup
      .append('line')
      .attr('id', 'focus-line-time')
      .attr('class', 'focus-line')
      .style('pointer-events', 'none'); // Prevents events triggering when interacting with parent element

    const crosshairLabelsGroup = crosshairGroup.append('g').attr('class', 'focus-labels');

    crosshairLabelsGroup.append('text').attr('id', 'focus-label-time').attr('class', 'focus-label');
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
    const isStaticCoordinatesUsed = staticCoordinates === undefined;
    const coords = isStaticCoordinatesUsed ? this.d3.mouse(this.zoomableArea.node()) : staticCoordinates;
    const x = coords[0];
    const y = coords[1];
    const time = d3.timeFormat('%H:%M:%S')(new Date(0, 0, 0, 0, 0, this.timeScale.invert(x), 0));
    // Vertical line - time
    focusLines
      .select('#focus-line-time')
      .attr('x1', +x)
      .attr('y1', -10)
      .attr('x2', +x)
      .attr('y2', this.size.height + 35);

    focusLabels
      .select('#focus-label-time')
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
    const x = -7; // 0;
    const y = -40;
    const legendGroup = this.svg.append('g').attr('transform', 'translate(10, 0)');

    const rectWidth = 80;
    const rectHeight = 20;

    legendGroup
      .append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('transform', `translate(${x}, ${y})`)
      .style('mask', 'url(#mask)')
      .style('fill', 'grey');

    legendGroup
      .append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('transform', `translate(${x}, ${y})`)
      .style('stroke', 'black')
      .style('fill', 'none');

    legendGroup
      .append('text')
      .attr('transform', `translate(${x + rectWidth + 10}, ${y + rectHeight / 1.5 + 1})`)
      .html('Estimated time');
  }

  /**
   * Draws main line, events. Returns without any drawing if the players are not defined or the
   * current playerId is not among the participants -> e.g., supervisor
   * @param trainingRunId of player's trainig run to be drawn
   */
  drawPlayer(trainingRunId: number) {
    if (this.players === null) {
      return;
    }
    const player: TimelinePlayer = this.players.filter((p) => p.trainingRunId === trainingRunId)[0];
    if (player === undefined) {
      return;
    }
    const playerGroup = this.playersGroup
      .append('g')
      .attr('id', 'score-progress-player-' + player.trainingRunId)
      .style('mix-blend-mode', 'multiply');

    this.drawMainLine(playerGroup, player);
    this.drawContextLine(player);
  }

  /**
   * Draws main line and events
   * @param playersGroup svg group holding main line and events
   * @param player holding id and events
   * @param level
   */
  drawMainLine(playersGroup, player: TimelinePlayer, level?: TimelineLevel) {
    const lineGroup = playersGroup.append('g').attr('clip-path', 'url(#lineClip)');

    const colorScale = this.d3.scaleOrdinal().range(this.colorScheme || colorScheme);

    const line = lineGroup
      .append('path')
      .attr('d', this.lineGenerator(this.getEvents(player))) // (level as TrainingLevel).events)
      .attr('class', 'score-progress-player')
      .classed('score-progress-player-highlight', player.trainingRunId === Number(this.feedbackLearnerId))
      .classed('visible-line', true)
      .datum(player)
      .style('opacity', '0')
      .style('stroke', this.d3.hsl(this.playerColorScale(player.trainingRunId.toString()).toString()).darker(0.7));

    line.transition().duration(1000).style('opacity', '100');

    const clickableLine = lineGroup
      .append('path')
      .attr('d', this.lineGenerator(this.getEvents(player))) // (level as TrainingLevel).events)
      .attr('class', 'score-progress-player')
      .datum(player)
      .style('fill', 'none')
      .style('stroke', 'transparent')
      .style('stroke-width', '15px');

    this.addListenersToLine(clickableLine);

    playersGroup.append('g').attr('id', 'score-progress-events-' + player.trainingRunId);
    this.drawPlayersEvents(player);

    return line;
  }

  /**
   * @ignore
   */
  addListenersToLine(line) {
    line
      .on('mouseover', this.onLineMouseover.bind(this))
      .on('mousemove', this.onLineMousemove.bind(this))
      .on('mouseout', this.onLineMouseout.bind(this))
      .on('wheel', this.disableScrolling.bind(this));
  }

  /**
   * Highlights the line, show tooltip and crosshair
   * @param player
   */
  onLineMouseover(player: TimelinePlayer) {
    this.highlightLine(player.trainingRunId);
    this.lineTooltip.style('display', 'inline');
    this.showCrosshair();
  }

  /**
   * @ignore
   */
  highlightLine(playerId: number) {
    const playerGroup = this.d3.select('#score-progress-player-' + playerId);
    const path = playerGroup.select('.visible-line');
    path.classed('score-progress-player-highlight', true);
  }

  /**
   * Update tooltip and crosshair
   */
  onLineMousemove(player: TimelinePlayer) {
    this.updateLineTooltip(player);
    this.updateCrosshair();
  }

  /**
   * Add player's name/id to tooltip and updates its position
   * @param player
   */
  updateLineTooltip(player: TimelinePlayer) {
    const x: number = this.d3.event.pageX;
    const y: number = this.d3.event.pageY;
    const topMargin = -50;
    const top: number = y + topMargin;

    const content = `Player: <br> ${player.name.toString()}`;
    this.lineTooltip
      .attr('class', 'score-progress-line-tooltip')
      .style('left', x - 5 + 'px')
      .style('top', top + 'px')
      .style('margin-left', -content.length / 4 + 'em');
    this.lineTooltip.html(content);
  }

  /**
   * Unhighlights the line, hides tooltip and crosshair
   * @param player
   */
  onLineMouseout(player: TimelinePlayer) {
    this.unhighlightLine(`${player.trainingRunId}`);
    this.lineTooltip.style('display', 'none');
    this.hideCrosshair();
  }

  /**
   * @ignore
   */
  unhighlightLine(playerId: string) {
    if (playerId === this.feedbackLearnerId) {
      return;
    }
    const playerGroup = this.d3.select('#score-progress-player-' + playerId);
    const path = playerGroup.select('path');
    path.classed('score-progress-player-highlight', false);
  }

  /**
   * Draws line in a context bar
   * @param player holding its id and events
   * @param level
   */
  drawContextLine(player: TimelinePlayer, level?: TimelineLevel) {
    const contextLine = this.svg
      .select('.context')
      .append('path')
      .attr('d', this.contextLineGenerator(this.getEvents(player)))
      .attr('id', 'score-progress-context-player-' + player.trainingRunId)
      .attr('class', 'score-progress-context-player')
      .style('opacity', '0')
      .style('stroke', this.d3.hsl(this.playerColorScale(player.trainingRunId.toString()).toString()).darker(0.7));
    contextLine.transition().duration(1000).style('opacity', '100');
  }

  /**
   * Draws events onto main line
   * @param player
   */
  drawPlayersEvents(player: TimelinePlayer) {
    const filteredEvents = this.filterEvents(this.getEvents(player), player.trainingRunId);
    const colorScale = this.eventsColorScale;
    const eventsGroup = this.playersGroup
      .select('#score-progress-player-' + player.trainingRunId)
      .select('#score-progress-events-' + player.trainingRunId);

    let events = eventsGroup.selectAll('.event').data(filteredEvents, (event) => event.time);

    this.removeFilteredEvents(events);
    events = this.addNewEventsAndReturnThem(events);
    events
      .attr('r', 7)
      .attr('cx', (event) => this.timeScale(event.time))
      .attr('cy', (event) => this.scoreScale(event.score))
      .style('opacity', '0')
      .style('fill', (event) => {
        if (event.levelOrder === undefined) {
          return 'lightgray';
        }
        return this.d3.hsl(colorScale(event.levelOrder.toString()).toString()).darker(0.9);
      })
      .datum((event) => {
        event.playerId = player.trainingRunId;
        return event;
      })
      .style('stroke', 'black')
      .style('stroke-width', '0.5');

    this.drawInnerLevelUps(eventsGroup, filteredEvents, colorScale);
    this.addFadeInEffectTransition(events);
    this.addListenersToEvents(events);
  }

  /**
   * Filters elements with checked filters
   * @param unfilteredEvents to be filtered
   * @param playerId player's id
   */
  filterEvents(unfilteredEvents: TimelineEvent[], playerId: number) {
    const delay = 0;
    let events = [];

    // checks if there is any checked filter if not empty array of events is set
    if (Object.keys(this.filters).some((key) => this.filters[key].checked === true)) {
      Object.keys(this.filters).forEach((key) => {
        const filter = this.filters[key];
        if (filter.checked) {
          // Union operation between all events and filtered events. This needs to be done so filtering by multiple
          // filters won't filter events from each other
          events = [...new Set([...events, ...unfilteredEvents.filter(filter.filterFunction)])];
        }
      });
    } else {
      events = [];
    }
    return events;
  }

  /**
   * @ignore
   */
  removeFilteredEvents(events) {
    events.exit().transition().duration(200).attr('r', 0).remove();
  }

  addNewEventsAndReturnThem(events) {
    return events.enter().append('circle').attr('r', 0).attr('class', 'event');
  }

  /**
   * @ignore
   */
  addFadeInEffectTransition(events) {
    const fadeInEffect = this.d3.transition().duration(1000);

    events.transition(fadeInEffect).style('opacity', '100');
  }

  addListenersToEvents(events) {
    events
      .on('mouseover', this.onEventMouseover.bind(this))
      .on('mousemove', this.onEventMousemove.bind(this))
      .on('mouseout', this.onEventMouseout.bind(this))
      .on('wheel', this.disableScrolling.bind(this));
  }

  /**
   * Draws small circles in correct answer submit events
   * @param eventsGroup
   * @param filteredEvents
   * @param colorScale
   */
  drawInnerLevelUps(eventsGroup, filteredEvents: TimelineEvent[], colorScale) {
    let levelUpsInnerFill = eventsGroup.selectAll('.level-up').data(filteredEvents, (event) => event.time);

    levelUpsInnerFill.exit().remove();

    levelUpsInnerFill = levelUpsInnerFill
      .enter()
      .filter(
        (event) => event.text.toUpperCase().split(' ')[0] === 'CORRECT' && event.level !== this.getLevels().length
      )
      .append('circle')
      .attr('class', 'level-up')
      .attr('r', 4)
      .attr('cx', (event) => this.timeScale(event.time))
      .attr('cy', (event) => this.scoreScale(event.score))
      .style('fill', (event) => this.d3.hsl(colorScale((event.level + 1).toString()).toString()).darker(0.9))
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
    this.eventTooltip
      .attr('class', 'score-progress-tooltip')
      .style('left', left + 'px')
      .style('top', top + 'px');
    const event = this.getEventMessage(player);
    const scoreChange = player.score;
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
  onEventMousemove(d: TimelineEvent, index, nodeList) {
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
  getEventMessage(event: TimelineEvent) {
    return event.text;
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
  removePlayer(playerId: number) {
    this.playersGroup.select('#score-progress-player-' + playerId).remove();
    this.svg
      .select('.context')
      .select('#score-progress-context-player-' + playerId)
      .remove();
  }

  /**
   * Calculate new ticks when zooming.
   */
  redrawAxes(k) {
    this.xAxis.tickArguments([this.d3.timeMinute.every(this.tickLength / Math.round(k))]);
    this.svg.select('.score-progress.x-axis').call(this.xAxis);
  }

  /**
   * Updates line length when zooming
   */
  redrawPlayers() {
    this.playersGroup.selectAll('.score-progress-player').attr('d', (d) => this.lineGenerator(this.getEvents(d)));
    this.playersGroup.selectAll('circle').attr('cx', (d) => this.timeScale(d.time));
  }

  /**
   * Updates bar length when zooming
   * @param transform
   */
  redrawBars(transform) {
    this.svg
      .select('.score-progress-bars')
      .selectAll('rect')
      .attr('transform', `translate(${transform.x},0) scale(${transform.k}, 1)`);
  }

  /**
   * Retrieves all levels from all players
   */
  getLevels(): TimelineLevel[] {
    let levels = [];
    this.timelineData.timeline.playerData.forEach((player) => {
      levels = [...levels, ...player.levels];
    });

    // Filter duplicate levels
    levels = levels.filter(
      (level, index, self) => index === self.findIndex((t) => t.id === level.id && t.name === level.name)
    );
    return levels;
  }

  /**
   * Retrieves all events from player
   */
  getEvents(player: TimelinePlayer): TimelineEvent[] {
    let events = [];
    player.levels.forEach((level) => {
      if (level.levelType === TimelineLevelTypeEnum.TRAINING) {
        events = [...events, ...(level as TrainingLevel).events];
      } else if (level.levelType === TimelineLevelTypeEnum.INFO) {
        events = [...events, ...(level as InfoLevel).events];
      } else if (level.levelType === TimelineLevelTypeEnum.ASSESSMENT) {
        events = [...events, ...(level as AssessmentLevel).events];
      }
    });
    return events;
  }

  /**
   * Activates filter.
   */
  onFilterChange() {
    const checkedPlayers = this.players.filter((player) => player.checked);
    checkedPlayers.forEach((player) => {
      this.drawPlayersEvents(player);
    });
  }

  /**
   * Draws or removes player from the plane when row in score table clicked.
   */
  onRowClicked(player) {
    const p = this.players.find((el) => el.trainingRunId === player.trainingRunId);
    p.checked = !p.checked;
    if (p.checked) {
      this.drawPlayer(p.trainingRunId);
    } else {
      this.removePlayer(p.trainingRunId);
    }
  }

  /**
   * Resets zoom to normal
   */
  onResetZoom() {
    this.svg.select('.score-progress-zoom').transition().duration(250).call(this.zoom.transform, this.d3.zoomIdentity);
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
