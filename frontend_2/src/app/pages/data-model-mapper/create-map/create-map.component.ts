import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDialogRef, NbToastrService, NbComponentStatus, NbGlobalPhysicalPosition, NbToastrConfig } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { NgxConfigureService } from 'ngx-configure';
import { Mapper } from '../../../model/adapter/mapper';
import { AppConfig } from '../../../model/appConfig';
import { ErrorDialogAdapterService } from '../../error-dialog/error-dialog-adapter.service';
import { DMMService } from '../dmm.service';
import { AvailableAdaptersService } from '../../adapters/available-adapters.service';

@Component({
  selector: 'create-map-and-adapter',
  templateUrl: './create-map.component.html',
  styleUrls: ['./create-map.component.scss']
})
export class CreateMapComponent implements OnInit {

  @Input() value: any;
  @Output() editedValue = new EventEmitter<unknown>();
  adapterId: string
  name: string = ''
  sourceDataType: string
  selectedFile: File;
  json: Record<string, unknown>;
  loaded = false
  mappers: Mapper[];
  createAdapter = false
  mapId: string
  save
  update
  updateAdapter
  placeholders = {
    adapterId: this.translate.instant('general.adapters.adapterId'),
    mapId: this.translate.instant('general.dmm.mapId'),
    status: this.translate.instant('general.adapters.status'),
    url: this.translate.instant('general.adapters.status'),
    sourceDataType: this.translate.instant('general.adapters.source_data_type'),
    description: this.translate.instant('general.adapters.description'),
    type: this.translate.instant('general.adapters.type'),
    context: this.translate.instant('general.adapters.context'),
  }
  private appConfig: AppConfig;
  jsonMap: any;
  schema: any;

  constructor(
    private dmmService: DMMService,
    protected ref: NbDialogRef<CreateMapComponent>,
    private toastrService: NbToastrService,
    private errorService: ErrorDialogAdapterService,
    private availableAdapterService: AvailableAdaptersService,
    private translate: TranslateService,
    private configService: NgxConfigureService
  ) {
    this.appConfig = this.configService.config as AppConfig
  }

  cancel(): void {
    this.ref.close();
  }

  fixBrokenPageBug() {
    document.getElementsByTagName('html')[0].className = ""
  }

  ngOnInit(): void {

    this.loaded = false
    if (this.value)
      for (let key in this.value)
        this[key] = this.value[key]
  }

  confirm() {
    try {
      this.onSubmit()
    }
    catch (error) {
      console.error(error)
    }
  }

  async onSubmit() {

    try {

      let name = this.name,
        adapterId = this.adapterId

      if (adapterId == '' || adapterId == null)
        throw new Error("Adapter ID must be set");

      if (this.save) {
        await this.dmmService.saveMap({ name, adapterId }, this.jsonMap, this.schema);
        this.ref.close({ name, adapterId });
        this.editedValue.emit(this.value);
        this.showToast('primary', this.translate.instant('general.dmm.map_added_message'), '');
      }

      else {
        await this.dmmService.updateMap({ name, adapterId }, this.jsonMap, this.schema);
        this.ref.close({ name, adapterId });
        this.editedValue.emit(this.value);
        this.showToast('primary', this.translate.instant('general.dmm.map_edited_message'), '');
      }
    }
    catch (error) {
      console.error(error)
      let errors: Object[] = []

      if (!this.jsonMap) errors.push({
        "path": "root.map",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.schema) errors.push({
        "path": "root.schema",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.adapterId) errors.push({
        "path": "root.adapterId",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.name) errors.push({
        "path": "root.name",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })

      if (error.message == "Adapter ID must be set") {
        this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
            {
              "path": "root.adapterId",
              "property": "minLength",
              "message": "Value required",
              "errorcount": 1
            }
          ]
        });
      }
      else if (error.status == 0)
        this.errorService.openErrorDialog(error)
      else if (error.status && error.status == 400 || error.message == "Schema required" || error.message == "Map required")
        if (error?.error == "id already exists" || error?.error?.error == "id already exists")
          this.errorService.openErrorDialog({
            error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
              {
                "path": "root.mapId",
                "property": "minLength",
                "message": "A map with map ID < " + this.adapterId + " > already exists",
                "errorcount": 1
              }
            ]
          });
        else this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: errors
        });
    }
  }

  private showToast(type: NbComponentStatus, title: string, body: string) {
    const config = {
      status: type,
      destroyByClick: true,
      duration: 2500,
      hasIcon: true,
      position: NbGlobalPhysicalPosition.BOTTOM_RIGHT,
      preventDuplicates: true,
    } as Partial<NbToastrConfig>;

    this.toastrService.show(body, title, config);
  }
}

