import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimelineDataDTO } from '../dto/timeline/timeline-data-dto';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class TimelineApiService {
  private readonly trainingVisualizationEndpoint = `${this.configService.config.trainingServiceUrl}visualizations/training-instances`;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  getTimelineVisualizationData(): Observable<TimelineDataDTO> {
    return this.http.get<TimelineDataDTO>(
      `${this.trainingVisualizationEndpoint}/${this.configService.trainingInstanceId}/timeline`
    );
  }
}
