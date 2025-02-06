# Training run overview visualizations

## How to integrate

- Install npm package into your Angular app
- Add `node_modules/@cyberrangecz-platform/overview-visualization/styles.scss` to your styles in `angular.json`

## How to use json-server as mock backend with provided dummy data

1. Run `npm install`.
2. Run the json server with `npm run api` or manually with provided parameters `json-server -w ./utils/json-server/db.js --routes ./utils/json-server/routes.json --middlewares ./utils/json-server/server.js`.
3. Run the app in local environment and ssl `npm start` and access it on `https://localhost:4200`.

## How to use with other visualizations

- If cross visualization communication is required, see project's [wiki](https://gitlab.ics.muni.cz/muni-kypo-crp/frontend-angular/components/kypo-trainings-visualization-overview/-/wikis/home) for instructions

## Input parameters of _kypo-viz-overview-clustering_ component

`useLocalMock: boolean` to use local jsons of a visualization

`enableAllPlayers: boolean` set true to show all the players of a selected training run, false will only show the learner specified by feedbackLearnerId

`feedbackLearnerId: string` if set, it highlights the given learner dot in the clustering

`colorScheme: string[]` to specify color scheme of individual bars by hexadecimal strings (e.g. '#20d5fa')

`size: {width: number; height: number}` object that specifies the vis size in pixels

`trainingDefinitionId: number`

`trainingInstanceId: number`

## How to use as a library

- there are 3 components that can be independent (it depends on their parameters)

### Overview Table

```
<kypo-viz-overview-table
    [trainingDefinitionId]="1"
    [standalone]="true"           <--- this ensures that the table does not cooperate with the timeline visualization and can be run independently
    [trainingInstanceId]="1"
    [trainingRunId]="4"
    [feedbackLearnerId]="'player'"> <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
</kypo-viz-overview-table>
```

### Clustering

```
<kypo-viz-overview-clustering
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 800, height: 500}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</kypo-viz-overview-clustering>
```

### Timeline

```
<kypo-viz-overview-timeline
  [enableAllPlayers]="true"      <--- when set to false, it will hide the related filtering table and show only the line related to the feedbackLearnerId
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 1300, height: 700}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</kypo-viz-overview-timeline>
```
