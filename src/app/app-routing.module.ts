import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'visualization',
    loadChildren: () => import('src/app/visualization/visualization.module').then(m => m.VisualizationModule),
  },
  {
    path: '',
    redirectTo: 'visualization',
    pathMatch: 'full'
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
