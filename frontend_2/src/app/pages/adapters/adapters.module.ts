import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbCardModule, NbSelectModule, NbAccordionModule, NbButtonModule, NbSpinnerModule, NbIconModule, NbToastrModule, NbContextMenuModule, NbInputModule, NbCheckboxModule, NbTagModule, NbRadioModule, NbTabsetModule, NbAutocompleteModule } from "@nebular/theme";
import { TranslateModule } from "@ngx-translate/core";
import { Ng2SmartTableModule } from "ng2-smart-table";

import { AvailableAdaptersService } from "./available-adapters.service";


@NgModule({
  imports: [
    CommonModule,
    Ng2SmartTableModule,
    NbCardModule,
    NbSelectModule,
    NbAccordionModule,
    NbButtonModule,
    NbSpinnerModule,
    NbIconModule,
    NbToastrModule,
    NbContextMenuModule,
    NbInputModule,
    NbCheckboxModule,
    NbTagModule,
    NbRadioModule,
    NbTabsetModule,
    TranslateModule.forChild({}),
    FormsModule,
    ReactiveFormsModule,
    NbAutocompleteModule
  ],
  declarations: [

  ],
  providers: [AvailableAdaptersService],
  entryComponents: [
  ],
})
export class AdaptersModule {}
