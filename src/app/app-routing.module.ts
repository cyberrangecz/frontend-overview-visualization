import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {SentinelAuthGuardWithLogin, SentinelNegativeAuthGuard} from '@sentinel/auth/guards';
import {SentinelAuthProviderListComponent} from '@sentinel/auth/components';
const routes: Routes = [
  {
    path: 'visualization',
    loadChildren: () => import('src/app/visualization/visualization.module').then(m => m.VisualizationModule),
    // canActivate: [SentinelAuthGuardWithLogin],
  },
  {
    path: '',
    redirectTo: 'visualization',
    pathMatch: 'full',
  },
  // {
  //   path: 'login',
  //   component: SentinelAuthProviderListComponent,
  //   canActivate: [SentinelNegativeAuthGuard]
  // },
  {
    path: '**',
    redirectTo: 'visualization'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
