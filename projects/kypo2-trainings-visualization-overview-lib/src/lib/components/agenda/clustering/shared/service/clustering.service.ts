import { Injectable } from '@angular/core';
import { Kypo2TraineeModeInfo } from '../../../../../shared/interfaces/kypo2-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ClusteringApiService } from '../../../../api/clustering/clustering-api.service';
import { ClusteringMapper } from '../../../../api/mappers/clustering/clustering-mapper';
import { ClusteringGameData } from '../../../../model/clustering/clustering-game-data';

@Injectable()
export class ClusteringService {
  constructor(private clusteringFinalApiService: ClusteringApiService) {}

  public getAllData(traineeModeInfo: Kypo2TraineeModeInfo): Observable<ClusteringGameData> {
    const service = Kypo2TraineeModeInfo.isTrainee(traineeModeInfo) ?
      this.clusteringFinalApiService.getAnonymizedClusteringVisualizationData() :
      this.clusteringFinalApiService.getClusteringVisualizationData();

    return service.pipe(
      map((data) => ClusteringMapper.fromDTO(data)),
      catchError((error) => {
        return throwError('clusteringService not connect to API: ' + error.message);
      })
    );
  }
}
