import { DMMComponent } from './../../data-model-mapper/dmm.component';
import { Component, OnInit, TemplateRef, ViewChild, Inject, OnChanges, SimpleChanges } from '@angular/core';
import {
  NbDialogRef,
  NbDialogService,
  NbWindowService,
} from '@nebular/theme';
import * as _ from "lodash"
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig } from '../../../model/appConfig';
import { CreateMapComponent } from '../../data-model-mapper/create-map/create-map.component';
import { DialogDataMapComponent } from '../../data-model-mapper/dialog-dataMap/dialog-dataMap.component';
import { DialogImportComponent } from '../../data-model-mapper/dialog-import/dialog-import.component';
import { DMMService } from '../../data-model-mapper/dmm.service';
import { ExportFileComponent } from '../../data-model-mapper/export-file/export-file.component';
import { ErrorDialogAdapterService } from '../../error-dialog/error-dialog-adapter.service';
import * as JSONEditor from '../../../../../node_modules/jsoneditor/dist/jsoneditor.js';


let mapOptionsGl, mapGl = "Set your mapping fields here", mapperEditor

//let map = {}, mapperEditor, mapOptions: string[]
@Component({
  selector: 'transform',
  //templateUrl: './transform.component.html',
  templateUrl: '../../data-model-mapper/dmm.component.html',
  styleUrls: ['./transform.component.scss'],
})

export class TransformComponent extends DMMComponent implements OnInit, OnChanges {

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public dialogService: NbDialogService,
    public windowService: NbWindowService,
    public errorService: ErrorDialogAdapterService,
    public dmmService: DMMService,
    public route: ActivatedRoute,
    public configService: NgxConfigureService,
    public ref: NbDialogRef<TransformComponent>,
  ) {
    super(document, dialogService, windowService, errorService, dmmService, route, configService)
    this.config = configService.config as AppConfig;
    this.emptySource = true
  }
}


