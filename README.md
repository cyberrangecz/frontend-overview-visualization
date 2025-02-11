# Training run overview visualizations

## How to integrate

- Install npm package into your Angular app
- Add `node_modules/@cyberrangecz-platform/overview-visualization/styles.scss` to your styles in `angular.json`

## Running the demo app

1. Configure and run the [Training service](https://github.com/cyberrangecz/backend-training) and the [User and group service](https://github.com/cyberrangecz/backend-user-and-group) or the whole [deployment](https://github.com/cyberrangecz/devops-helm).
2. Configure the [environment.local.ts](src/environments/environment.local.ts) file, pointing to the services.
3. Run `npm install` to install dependencies.
4. Run the app in local environment and ssl via `npm run start`.
5. Navigate to `https://localhost:4200/`. The app will automatically reload if you change any of the source files. The app will use a self-signed certificate, so you will need to accept it in the browser.

## How to use with other visualizations

- If cross visualization communication is required, see project's [wiki](LINK-HERE) for instructions

## Input parameters of _crczp-viz-overview-clustering_ component

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
<crczp-viz-overview-table
    [trainingDefinitionId]="1"
    [standalone]="true"           <--- this ensures that the table does not cooperate with the timeline visualization and can be run independently
    [trainingInstanceId]="1"
    [trainingRunId]="4"
    [feedbackLearnerId]="'player'"> <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
</crczp-viz-overview-table>
```

### Clustering

```
<crczp-viz-overview-clustering
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 800, height: 500}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</crczp-viz-overview-clustering>
```

### Timeline

```
<crczp-viz-overview-timeline
  [enableAllPlayers]="true"      <--- when set to false, it will hide the related filtering table and show only the line related to the feedbackLearnerId
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 1300, height: 700}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</crczp-viz-overview-timeline>
```
