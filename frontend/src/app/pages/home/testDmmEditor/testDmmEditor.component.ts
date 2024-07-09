import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService, NbWindowService, NbToastrService, NbDialogRef } from '@nebular/theme';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig } from '../../../model/appConfig';
import { DMMComponent } from '../../data-model-mapper/dmm.component';
import { DMMService } from '../../data-model-mapper/dmm.service';
import { ErrorDialogMapperRecordService } from '../../error-dialog/error-dialog-mapperRecord.service';

@Component({
  selector: 'app-testDmmEditor',
  templateUrl: '../../data-model-mapper/dmm.component.html',
  styleUrls: ['./testDmmEditor.component.scss']
})
export class TestDmmEditorComponent extends DMMComponent implements OnInit, OnChanges {

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public dialogService: NbDialogService,
    public windowService: NbWindowService,
    public errorService: ErrorDialogMapperRecordService,
    public dmmService: DMMService,
    public toastrService: NbToastrService,
    public route: ActivatedRoute,
    public configService: NgxConfigureService,
    public ref: NbDialogRef<TestDmmEditorComponent>
  ) {
    super(document, dialogService, windowService, errorService, dmmService,  toastrService, route, configService)
    this.config = configService.config as AppConfig;
    this.source.emptySource = true
  }

  async ngOnInit(): Promise<void> {
    await super.ngOnInit()
    const button = document.getElementById('preview');
    if (button) {
      const event = new MouseEvent('click', { bubbles: true });
      button.dispatchEvent(event);
    }
  }

}
