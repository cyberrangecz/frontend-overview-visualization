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
