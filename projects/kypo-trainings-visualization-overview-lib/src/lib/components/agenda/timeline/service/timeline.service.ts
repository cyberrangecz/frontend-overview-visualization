import { Injectable } from '@angular/core';
import { KypoTraineeModeInfo } from '../../../../shared/interfaces/kypo-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TimelineApiService } from '../../../api/timeline/timeline-api.service';
import { Timeline } from '../../../model/timeline/timeline';
import { TimelineMapper } from '../../../api/mappers/timeline/timeline-mapper';

@Injectable()
export class TimelineService {
  constructor(private timelineApiService: TimelineApiService) {}

  getAllData(traineeModeInfo: KypoTraineeModeInfo): Observable<Timeline> {
    const service = KypoTraineeModeInfo.isTrainee(traineeModeInfo)
      ? this.timelineApiService.getAnonymizedTimelineVisualizationData()
      : this.timelineApiService.getTimelineVisualizationData();

    return service.pipe(
      map((data) => TimelineMapper.fromDTO(data)),
      catchError((error) => {
        return throwError('timeline service not connect to API: ' + error.message);
      })
    );
  }
}
