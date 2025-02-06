import { Injectable } from '@angular/core';
import { TableApiService } from '../../../api/table/table-api.service';
import { KypoTraineeModeInfo } from '../../../../shared/interfaces/kypo-trainee-mode-info';
import { Observable, throwError } from 'rxjs';
import { TableData } from '../../../model/table/table-data';
import { catchError, map } from 'rxjs/operators';
import { TableMapper } from '../../../api/mappers/table/table-mapper';

@Injectable()
export class TableDataService {
  constructor(private tableApiService: TableApiService) {}

  getAllData(traineeModeInfo: KypoTraineeModeInfo): Observable<TableData> {
    const service = KypoTraineeModeInfo.isTrainee(traineeModeInfo)
      ? this.tableApiService.getAnonymizedTableVisualizationData()
      : this.tableApiService.getTableVisualizationData();

    return service.pipe(
      map((data) => TableMapper.fromDTO(data)),
      catchError((error) => {
        return throwError('tableService not connect to API: ' + error.message);
      }),
    );
  }
}
