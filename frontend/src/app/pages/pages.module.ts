import { NgModule } from '@angular/core';
import { NbCardModule, NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { ErrorComponent } from './error/error.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    DashboardModule,
    TranslateModule.forChild({})
  ],
  declarations: [
    PagesComponent,
    ErrorComponent,
  ],
})
export class PagesModule {
}
