export enum GenericEvent {
  TypePrefix = 'cz.muni.csirt.kypo.events.trainings.',

  HintTaken = 'HintTaken',
  CorrectFlag = 'CorrectFlagSubmitted',
  WrongFlag = 'WrongFlagSubmitted',
  SolutionDisplayed = 'SolutionDisplayed',
  GameSurrendered = 'TrainingRunSurrendered',
  LevelCompleted = 'LevelCompleted',
  LevelStarted = 'LevelStarted',
  GameStarted = 'TrainingRunStarted'
}
