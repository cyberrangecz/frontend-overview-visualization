export const environment = {
  production: true,
  kypo2TrainingsVisualizationRestBasePath: 'http://147.251.21.216:8085/kypo2-rest-trainings-visualization-overview/api/v1/',
  baseUrl: 'http://147.251.21.216:8083/kypo2-rest-training/api/v1',

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

};
