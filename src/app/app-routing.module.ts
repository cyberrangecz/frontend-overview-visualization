import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Kypo2AuthGuardWithLogin, Kypo2AuthProviderPickerComponent, Kypo2NotAuthGuardService } from 'kypo2-auth';
const routes: Routes = [
  {
    path: 'visualization',
    loadChildren: () => import('src/app/visualization/visualization.module').then(m => m.VisualizationModule),
    canActivate: [Kypo2AuthGuardWithLogin],
  },
  {
    path: '',
    redirectTo: 'visualization',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Kypo2AuthProviderPickerComponent,
    canActivate: [Kypo2NotAuthGuardService]
  },
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
