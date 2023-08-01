import { NgModule } from '@angular/core';
import { ErrorDialogComponent } from './error-dialog.component';
import { NbCardModule,  NbAccordionModule } from '@nebular/theme';
import { ErrorDialogService } from './error-dialog.service';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorDialogAdapterComponent } from './error-dialog-adapter.component';
import { ErrorDialogAdapterService } from './error-dialog-adapter.service';

@NgModule({
  imports: [TranslateModule.forChild({}),NbAccordionModule, CommonModule, NbCardModule, TranslateModule.forChild()],
  declarations: [ErrorDialogComponent,  ErrorDialogAdapterComponent,],
  exports: [ErrorDialogComponent,  ErrorDialogAdapterComponent],
  entryComponents: [ErrorDialogComponent,  ErrorDialogAdapterComponent],
  providers: [ErrorDialogService, ErrorDialogAdapterService, Location],
})
export class ErrorDialogModule {}
