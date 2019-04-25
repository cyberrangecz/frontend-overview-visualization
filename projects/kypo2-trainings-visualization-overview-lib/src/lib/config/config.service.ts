import {Injectable} from '@angular/core';
import {UserAndGroupManagementConfig} from './user-and-group-management-config';

@Injectable()
export class ConfigService {
  private readonly _config: UserAndGroupManagementConfig;

  get config(): UserAndGroupManagementConfig {
    return this._config;
  }

  constructor(config: UserAndGroupManagementConfig) {
    this._config = config;
  }
}
