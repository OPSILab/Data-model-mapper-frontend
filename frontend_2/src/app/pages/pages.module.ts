import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [PagesRoutingModule, ThemeModule, NbMenuModule, TranslateModule.forChild({}),],
  declarations: [PagesComponent],
  providers: [],
})
export class PagesModule {}
