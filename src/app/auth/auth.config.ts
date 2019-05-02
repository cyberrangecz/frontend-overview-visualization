import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '../environments/environment';

export const authConfig: AuthConfig = {

  issuer: environment.issuer,
  redirectUri: environment.redirectUri,
  clientId: environment.clientId,
  scope: environment.scope,
  sessionChecksEnabled: environment.sessionChecksEnabled
};

