// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// OIDC url
const OIDC_URL = 'https://localhost:8080';
// backend url
const API_URL = 'http://localhost:3000';
// frontend home url
const HOME_URL = 'https://localhost:4200';

export const environment = {
    production: false,
    trainingServiceUrl: API_URL + '/training/api/v1/',
    authConfig: {
        guardMainPageRedirect: 'visualization',
        guardLoginPageRedirect: 'login',
        interceptorAllowedUrls: [API_URL, OIDC_URL, 'https://localhost', 'http://localhost'],
        authorizationStrategyConfig: {
            authorizationUrl: API_URL + '/user-and-group/api/v1/users/info'
        },
        // OIDC SETTINGS
        providers: [
            {
                label: 'Login with local Keycloak',
                textColor: 'white',
                backgroundColor: '#1e2173',
                oidcConfig: {
                    requireHttps: true,
                    clearHashAfterLogin: true,
                    issuer: OIDC_URL + '/keycloak/realms/CRCZP',
                    clientId: 'CRCZP-client',
                    redirectUri: HOME_URL,
                    scope: 'openid email profile offline_access',
                    logoutUrl: OIDC_URL + '/keycloak/realms/CRCZP/protocol/openid-connect/logout',
                    silentRefreshRedirectUri: HOME_URL + '/silent-refresh.html',
                    postLogoutRedirectUri: HOME_URL + '/logout-confirmed'
                }
            }
        ]
    }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
