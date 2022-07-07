import { Injectable } from '@angular/core';
import { KypoTraineeModeInfo } from '../../../../../shared/interfaces/kypo-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ClusteringApiService } from '../../../../api/clustering/clustering-api.service';
import { ClusteringMapper } from '../../../../api/mappers/clustering/clustering-mapper';
import { ClusteringTrainingData } from '../../../../model/clustering/clustering-training-data';

@Injectable()
export class ClusteringService {
  constructor(private clusteringFinalApiService: ClusteringApiService) {}

  public getAllData(traineeModeInfo: KypoTraineeModeInfo): Observable<ClusteringTrainingData> {
    const service = KypoTraineeModeInfo.isTrainee(traineeModeInfo)
      ? this.clusteringFinalApiService.getAnonymizedClusteringVisualizationData()
      : this.clusteringFinalApiService.getClusteringVisualizationData();

    return service.pipe(
      map((data) => ClusteringMapper.fromDTO(data)),
      catchError((error) => {
        return throwError('clusteringService not connect to API: ' + error.message);
      })
    );
  }
}
