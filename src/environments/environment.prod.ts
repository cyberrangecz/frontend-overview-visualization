export const environment = {
  production: true,
  kypo2TrainingsVisualizationRestBasePath: 'http://147.251.21.216:8085/kypo2-rest-trainings-visualization-overview/api/v1/',
  defaultPaginationSize: 10,

  // OIDC SETTINGS
  // Url of the Identity Provider
  issuer: 'https://oidc.ics.muni.cz/oidc/',
  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/index.html',
  // The SPA's id. The SPA is registered with this id at the auth-server
  clientId: '3693320b-6acb-442c-be51-86e18f574f9d',
  // set the scope for the permissions the client should request
  scope: 'openid profile email',
  sessionChecksEnabled: false,
};
