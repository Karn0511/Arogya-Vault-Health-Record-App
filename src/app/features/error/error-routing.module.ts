import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

const routes: Routes = [
    { path: '', component: UnauthorizedComponent },
    { path: 'unauthorized', component: UnauthorizedComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ErrorRoutingModule { }
