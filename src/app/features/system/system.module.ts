import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

@NgModule({
    declarations: [
        UnauthorizedComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SystemRoutingModule
    ]
})
export class SystemModule { }
