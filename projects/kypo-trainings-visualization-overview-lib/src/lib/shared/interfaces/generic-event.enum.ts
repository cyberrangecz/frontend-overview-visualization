export enum GenericEvent {
  TypePrefix = 'cz.muni.csirt.kypo.events.trainings.',

  HintTaken = 'HintTaken',
  CorrectAnswer = 'CorrectAnswerSubmitted',
  WrongAnswer = 'WrongAnswerSubmitted',
  SolutionDisplayed = 'SolutionDisplayed',
  TrainingSurrendered = 'TrainingRunSurrendered',
  LevelCompleted = 'LevelCompleted',
  LevelStarted = 'LevelStarted',
  TrainingStarted = 'TrainingRunStarted',
}
