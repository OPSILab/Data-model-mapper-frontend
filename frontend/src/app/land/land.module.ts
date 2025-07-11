import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandComponent } from './land.component';
import { LandRoutingModule } from './land-routing.module';
import { ScrollRevealDirective2 } from '../directives/scroll-reveal.directive2';



@NgModule({
  declarations: [LandComponent, ScrollRevealDirective2],
  imports: [
    CommonModule,
    LandRoutingModule
  ]
})
export class LandModule { }
