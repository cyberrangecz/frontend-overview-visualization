# Training run overview visualizations
[Documentation (thesis)](https://is.muni.cz/auth/th/w9g9t/?lang=cs)

## How to integrate
- Build library with `npm run lib-build`
- Install npm package into your Angular app
- Add `node_modules/kypo2-trainings-visualization-overview-lib/styles.scss` to your styles in `angular.json` 

## How to use with other visualizations
- If cross visualization communication is required, see project's [wiki](https://gitlab.ics.muni.cz/kypo2/frontend-new/kypo2-trainings-visualization-overview/wikis/home) for instructions

## Input parameters of *kypo2-viz-overview-clustering* component

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
<kypo2-viz-overview-table
    [useLocalMock]="true"         <--- if set to true, the visualization will use mocked data (available only when run localy!)
    [trainingDefinitionId]="1"
    [standalone]="true"           <--- this ensures that the table does not cooperate with the timeline visualization and can be run independently
    [trainingInstanceId]="1"
    [feedbackLearnerId]="'player'"> <--- the id should be set *only* for the trainee view - the vis. will provide a limited information 
</kypo2-viz-overview-table>
```

### Clustering

```
<kypo2-viz-overview-clustering
  [useLocalMock]="true"          <--- if set to true, the visualization will use mocked data (available only when run localy!)
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information 
  [size]="{width: 800, height: 500}"
  [trainingInstanceId]="2"
  [trainingDefinitionId]="3">
</kypo2-viz-overview-clustering>
```
### Timeline

```
<kypo2-viz-overview-timeline
  [useLocalMock]="true"          <--- if set to true, the visualization will use mocked data (available only when run localy!)
  [enableAllPlayers]="true"      <--- when set to false, it will hide the related filtering table and show only the line related to the feedbackLearnerId
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information 
  [size]="{width: 1300, height: 700}"
  [trainingInstanceId]="2"
  [trainingDefinitionId]="3">
</kypo2-viz-overview-timeline>
```
