# Training run overview visualizations

## Input parameters of _crczp-visualization-overview-clustering_ component

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
<crczp-visualization-overview-table
    [trainingDefinitionId]="1"
    [standalone]="true"           <--- this ensures that the table does not cooperate with the timeline visualization and can be run independently
    [trainingInstanceId]="1"
    [trainingRunId]="4"
    [feedbackLearnerId]="'player'"> <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
</crczp-visualization-overview-table>
```

### Clustering

```
<crczp-visualization-overview-clustering
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 800, height: 500}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</crczp-visualization-overview-clustering>
```

### Timeline

```
<crczp-visualization-overview-timeline
  [enableAllPlayers]="true"      <--- when set to false, it will hide the related filtering table and show only the line related to the feedbackLearnerId
  [feedbackLearnerId]="'player'" <--- the id should be set *only* for the trainee view - the vis. will provide a limited information
  [size]="{width: 1300, height: 700}"
  [trainingInstanceId]="2"
  [trainingRunId]="4"
  [trainingDefinitionId]="3">
</crczp-visualization-overview-timeline>
```
