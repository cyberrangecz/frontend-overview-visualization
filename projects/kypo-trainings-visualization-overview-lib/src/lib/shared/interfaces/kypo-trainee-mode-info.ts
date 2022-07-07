/**
 * Use if visualization should use anonymized data (without names and credentials of other users) from trainee point of view
 */
export class KypoTraineeModeInfo {
  trainingRunId: number;
  activeTraineeId: number;

  static isTrainee(traineeModeInfo: KypoTraineeModeInfo) {
    return (
      traineeModeInfo &&
      traineeModeInfo.trainingRunId !== undefined &&
      traineeModeInfo.trainingRunId !== null &&
      traineeModeInfo.activeTraineeId !== undefined &&
      traineeModeInfo.activeTraineeId !== null
    );
  }
}
