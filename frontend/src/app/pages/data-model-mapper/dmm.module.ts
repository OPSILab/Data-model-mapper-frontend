import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbAccordionModule, NbButtonModule, NbCardModule, NbToggleModule, NbIconModule, NbTabsetModule, NbSelectModule, NbInputModule, NbRadioModule, NbWindowModule, NbCheckboxModule, NbUserModule, NbAutocompleteModule } from "@nebular/theme";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { CreateMapAndAdapterComponent } from "./create-map-and-adapter/create-map-and-adapter.component";
import { DialogDataMapComponent } from "./dialog-dataMap/dialog-dataMap.component";
import { DialogImportComponent } from "./dialog-import/dialog-import.component";
import { DMMRoutingModule } from "./dmm-routing.module";
import { DMMComponent } from "./dmm.component";
import { DMMService } from "./dmm.service";
import { ExportFileComponent } from "./export-file/export-file.component";
import { AvailableAdaptersService } from "./available-adapters.service";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
  imports: [
    Ng2SmartTableModule,
    CommonModule,
    DMMRoutingModule,
    NbAccordionModule,
    NbButtonModule,
    NbCardModule,
    NbToggleModule,
    NbIconModule,
    NbTabsetModule,
    NbToggleModule,
    FormsModule,
    //NgbDropdownModule,
    //NgbCollapseModule,
    NbSelectModule,
    NbInputModule,
    NbRadioModule,
    ReactiveFormsModule,
    NbWindowModule.forChild(),
    NbCheckboxModule,
    NbUserModule,
    TranslateModule.forChild({}),
    NbAutocompleteModule
  ],
  declarations: [DMMComponent,DialogImportComponent,DialogDataMapComponent, CreateMapAndAdapterComponent, ExportFileComponent,],
  providers: [DMMService, AvailableAdaptersService],
  entryComponents: [
    DialogImportComponent,
    DialogDataMapComponent

  ]
})
export class DMMModule {}
