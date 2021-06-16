import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../config/config.service';
import { ClusteringVisualizationResourceDTO } from '../dto/clustering/clustering-visualization-resource-dto';

@Injectable()
export class ClusteringApiService {
  private readonly trainingVisualizationEndpoint = `${this.configService.config.trainingServiceUrl}visualizations/training-instances`;
  private readonly anonymizedTrainingVisualizationEndpoint = `${this.configService.config.trainingServiceUrl}visualizations/training-runs`;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  getClusteringVisualizationData(): Observable<ClusteringVisualizationResourceDTO> {
    return this.http.get<ClusteringVisualizationResourceDTO>(
      `${this.trainingVisualizationEndpoint}/${this.configService.trainingInstanceId}/clustering`
    );
  }

  getAnonymizedClusteringVisualizationData(): Observable<ClusteringVisualizationResourceDTO> {
    return this.http.get<ClusteringVisualizationResourceDTO>(
      `${this.anonymizedTrainingVisualizationEndpoint}/${this.configService.trainingRunId}/clustering`
    );
  }
}
