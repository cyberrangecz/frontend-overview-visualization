import { Injectable } from '@angular/core';
import { Kypo2TraineeModeInfo } from '../../../../shared/interfaces/kypo2-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TimelineApiService } from '../../../api/timeline/timeline-api.service';
import { Timeline } from '../../../model/timeline/timeline';
import { TimelineMapper } from '../../../api/mappers/timeline/timeline-mapper';

@Injectable()
export class TimelineService {
  constructor(private timelineApiService: TimelineApiService) {}

  getAllData(traineeModeInfo: Kypo2TraineeModeInfo): Observable<Timeline> {
    return this.timelineApiService.getTimelineVisualizationData().pipe(
      map((data) =>
        TimelineMapper.fromDTO(data, Kypo2TraineeModeInfo.isTrainee(traineeModeInfo), traineeModeInfo ? traineeModeInfo.activeTraineeId : 0)
      ),
      catchError((error) => {
        return throwError('timeline service not connect to API: ' + error.message);
      })
    );
  }
}
