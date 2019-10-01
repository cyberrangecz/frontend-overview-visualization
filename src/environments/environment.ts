// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  kypo2TrainingsVisualizationRestBasePath: 'https://kypo-devel.ics.muni.cz:8083/kypo2-rest-training/api/v1/',
  baseUrl: 'https://kypo-devel.ics.muni.cz:8083/kypo2-rest-training/api/v1/',

  // OIDC SETTINGS
  // Url of the Identity Provider
  issuer: 'https://oidc.muni.cz/oidc/',
  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin,
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin,
  // The SPA's id. The SPA is registered with this id at the config-server
  clientId: 'b53f2660-8fa0-4d32-94e4-23a59d7e7077',
  // set the scope for the permissions the client should request
  scope: 'openid profile email',
  sessionChecksEnabled: false,
  kypo2AuthConfig: {
    maxRetryAttempts: 3,
    guardMainPageRedirect: 'visualization',
    guardLoginPageRedirect: 'login',
    tokenInterceptorAllowedUrls: [
      'https://kypo-devel.ics.muni.cz'
    ],
    userInfoRestUri: 'https://kypo-devel.ics.muni.cz:8084/kypo2-rest-user-and-group/api/v1/',
    providers: [
      {
        label: 'Login with MUNI',
        textColor: 'white',
        backgroundColor: '#002776',
        tokenRefreshTime: 30000,
        oidcConfig: {
          issuer: 'https://oidc.muni.cz/oidc/',
          clientId: 'b53f2660-8fa0-4d32-94e4-23a59d7e7077',
          redirectUri: window.location.origin,
          scope: 'openid email profile',
          logoutUrl: 'https://oidc.muni.cz/oidc/endsession',
          postLogoutRedirectUri: window.location.origin,
          clearHashAfterLogin: true
        },
      },
    ]
  },
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
