import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GridRendererComponent } from './components/grid-renderer/grid-renderer.component';

const routes: Routes = [
  { path: '', component: GridRendererComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
