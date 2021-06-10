import { Injectable } from '@angular/core';
import { TableApiService } from '../../../api/table/table-api.service';
import { Kypo2TraineeModeInfo } from '../../../../shared/interfaces/kypo2-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { TableData } from '../../../model/table/table-data';
import { catchError, map, tap } from 'rxjs/operators';
import { TableMapper } from '../../../api/mappers/table/table-mapper';

@Injectable()
export class TableDataService {
  constructor(private tableApiService: TableApiService) {}

  getAllData(traineeModeInfo: Kypo2TraineeModeInfo): Observable<TableData> {
    return this.tableApiService.getTableVisualizationData().pipe(
      map((data) =>
        TableMapper.fromDTO(data, Kypo2TraineeModeInfo.isTrainee(traineeModeInfo), traineeModeInfo ? traineeModeInfo.activeTraineeId : 0)
      ),
      catchError((error) => {
        return throwError('tableService not connect to API: ' + error.message);
      })
    );
  }
}
