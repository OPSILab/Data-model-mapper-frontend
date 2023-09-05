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


let mapOptionsGl, mapGl, mapperEditor

//let map = {}, mapperEditor, mapOptions: string[]
@Component({
  selector: 'transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.scss'],
})

export class TransformComponent implements OnInit, OnChanges {

  inputID
  map
  //mapperEditor
  mapOptions
  sourceEditor: any;
  sourceEditorContainer: any;
  mapperEditorContainer: any;
  schemaEditorContainer
  outputEditorContainer: any;
  selectBox: any;
  inputType: any;
  isNew = false;
  separatorItem = ';';
  csvSourceData: any;
  sourceRef: string = '';
  typeSource: string;
  adapter
  mapObject
  flipped = false;
  csvtable: any;
  sourceRefFormat: string;
  paths: string[];
  mapperEditor: any;
  maps: any;
  mapper
  schemas
  selectedSchema
  schemaJson: any[];
  outputEditor: any;
  outputEditorOptions: any;
  sourceJson: any;
  schemaFromFile
  selectedPath: any;
  selectMap
  schemaOrMap = "schema"
  name
  adapterId
  partialCsv: any;
  rows: string[];
  schemaEditor: any;
  selectedDataModel;
  options2: {
    mode: string; modes: string[]; // allowed modes
    onModeChange: (newMode: any, oldMode: any) => void; onCreateMenu: (items: any, node: any) => any;
  };
  dataModelURL: any;
  sourceDataURL: any;
  selectedSource
  sources: any;
  snippet: any;
  config: AppConfig;
  NGSI: Boolean
  savedSource: any;
  savedSchema: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    protected dialogService: NbDialogService,
    private windowService: NbWindowService,
    private errorService: ErrorDialogAdapterService,
    private dmmService: DMMService,
    private route: ActivatedRoute,
    configService: NgxConfigureService,
    protected ref: NbDialogRef<TransformComponent>,
  ) {
    this.config = configService.config as AppConfig;
  }

  toggleView() {
    this.flipped = !this.flipped;
  }

  updateMap() {
    mapGl = this.map
  }

  updateAdapter() {
    let type = this.inputType
    let source = JSON.parse(this.sourceEditor.getText())

    if (source[this.selectedPath])
      source = source[this.selectedPath]

    console.debug(this.NGSI)
    this.dialogService.open(CreateMapComponent, {
      context: {
        value: this.adapter,
        name: this.name,
        update: true,
        sourceDataType: type,
        jsonMap: JSON.parse(this.mapperEditor.getText()),
        schema: JSON.parse(this.schemaEditor.getText()),
        config: {
          delimiter: this.separatorItem,
          NGSI_entity: this.NGSI
        },
        sourceDataURL: this.sourceDataURL,
        sourceDataID: this.selectedSource,
        dataModelURL: this.dataModelURL,
        dataModelID: this.selectedSchema && this.selectedSchema != "---select schema---" ? this.selectedSchema : undefined,
        sourceData: this.inputType == "json" ? source : this.csvSourceData,
        schemaSaved: this.savedSchema,
        sourceSaved: this.savedSource
      }
    }).onClose.subscribe(async (adapter) => {
      if (adapter) {
        this.adapter = adapter;
        this.savedSchema = adapter.saveSchema
        this.savedSource = adapter.saveSource
      }
    });
  }

  schemaChanged($event) {
    if ($event && $event != "---select schema---") {
      if (this.dataModelURL) this.dataModelURL = undefined
      if (this.selectedSchema)
        this.schemaJson = [
          this.schema()
        ];
      console.debug(this.schemaJson)
      this.map = this.getAllNestedProperties(this.schemaJson[0]);
      mapGl = this.map
      this.mapperEditor.update(this.map)
      this.selectMap = "---select map---"
      this.selectedDataModel = this.schemaJson
      this.schemaEditor.update(this.selectedDataModel)
    }
  }

  sourceChanged($event) {

    //if ($event && $event != "---select schema---") {
    if (this.selectedSource) {
      if (this.sourceDataURL) this.sourceDataURL = undefined
      if (this.inputType == "json") {
        this.sourceJson = this.source();
        this.sourceEditor.update(this.sourceJson)
        mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
        this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), '')
        this.onUpdatePathForDataMap("")
      }
      else
        this.csvSourceData = this.source()

    }
  }

  reset() {
    this.adapter = {}
    this.isNew = false
    this.selectedDataModel = {
      "info": "set your schema here"
    }
    let preview = {
      "preview": "set the source, set the json map and click preview to see the output json preview"
    }
    this.mapperEditor.update({})
    this.schemaEditor.update(this.selectedDataModel)
    this.outputEditor.update(preview)
    this.selectMap = "---select map---"
    this.csvSourceData = ""
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.debug(changes);
  }

  setSchemaFromFile($event) {
    this.schemaFromFile = $event
    this.schemaJson = [
      this.schemaFromFile
    ]
    console.debug("THIS SCHEMA JSON")
    console.debug(this.schemaJson)
    this.map = this.getAllNestedProperties(this.schemaJson[0]);
    mapGl = this.map
    console.debug("THIS MAP")
    console.debug(this.map)
    this.mapperEditor.update(this.map)
  }

  async ngOnInit(): Promise<void> {

    this.sourceEditorContainer = this.document.getElementById('jsoneditor');
    this.mapperEditorContainer = this.document.getElementById('jsoneditor2');
    this.schemaEditorContainer = this.document.getElementById('schemaEditor');
    this.outputEditorContainer = this.document.getElementById('jsoneditor3');
    this.selectBox = <HTMLInputElement>this.document.getElementById('input-type');
    this.csvtable = this.document.getElementById('csv-table');

    try {
      await this.loadMapperList()
      await this.loadSchemaList()
      await this.loadSourceList()
    }
    catch (error) {
      console.error(error)
      this.errorService.openErrorDialog(error)
    }

    const options = {
      mode: 'view',
      modes: ['view', 'code'], // allowed modes
      onModeChange: function (newMode, oldMode) { },
    };

    this.sourceJson = {
      "info": "set your source json here"
    }

    this.selectedDataModel = {
      "info": "set your schema here"
    }

    let preview = {
      "preview": "set the source, set the json map and click preview to see the output json preview"
    }

    this.sourceEditor = new JSONEditor(this.sourceEditorContainer, options, this.sourceJson);

    this.schemaEditor = new JSONEditor(this.schemaEditorContainer, options, this.selectedDataModel)

    this.outputEditorOptions = {
      mode: 'view',
      modes: ['view', 'preview'], // allowed modes
      onModeChange: function (newMode, oldMode) { },
    };

    if (this.selectedSchema)
      this.schemaJson = [
        this.schema()
      ];

    this.setMapEditor(false);

    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, preview);
    else
      this.outputEditor.update(preview)

    if (this.inputID) {
      //this.inputID = this.route.snapshot.params['inputID'] as string;
      this.selectMap = this.inputID
      this.mapChanged(this.inputID)
      if (this.inputType == "csv") this.updateCSVTable()
    }
  }

  schema() {
    return this.schemas.filter(filteredSchema => filteredSchema.id == this.selectedSchema)[0].dataModel
  }

  source() {
    return this.sources.filter(filteredSource => filteredSource.id == this.selectedSource)[0].source || this.sources.filter(filteredSource => filteredSource.id == this.selectedSource)[0].sourceCSV
  }

  async loadMapperList() {
    this.maps = await this.dmmService.getMaps();
  }

  async loadSchemaList() {
    this.schemas = await this.dmmService.getSchemas();
  }

  async loadSourceList() {
    this.sources = await this.dmmService.getSources();
  }

  async testAdapter() {
    let output
    try {
      let m = JSON.parse(this.mapperEditor.getText())
      m["targetDataModel"] = "DataModelTemp"
      let source = JSON.parse(this.sourceEditor.getText())

      if (source[this.selectedPath])
        source = source[this.selectedPath]

      if (Array.isArray(source))
        source = [source[0], source[1], source[2]]

      this.partialCsv = ""

      if (this.rows)
        this.partialCsv = this.partialCsv
          .concat(this.rows[0])
          .concat("\r\n")
          .concat(this.rows[1])
          .concat("\r\n")
          .concat(this.rows[2])
          .concat("\r\n")
          .concat(this.rows[3])

      output = await this.dmmService.test(this.inputType, this.inputType == "csv" ? this.partialCsv : source, m, this.schemaJson[0], {
        delimiter: this.separatorItem,
        NGSI_entity: this.NGSI
      })
    }
    catch (error) {
      if (!output)
        output = error.error
      console.error(error)
    }
    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, output);
    else this.outputEditor.update(output)
  }

  async transform() {
    let output
    try {
      let m = JSON.parse(this.mapperEditor.getText())
      m["targetDataModel"] = "DataModelTemp"
      let source = JSON.parse(this.sourceEditor.getText())

      if (source[this.selectedPath])
        source = source[this.selectedPath]

      output = await this.dmmService.test(this.inputType, this.inputType == "csv" ? this.csvSourceData : source, m, this.schemaJson[0], {
        delimiter: this.separatorItem,
        NGSI_entity: this.NGSI
      })
    }
    catch (error) {
      if (!output)
        output = error.error
      console.error(error)
    }
    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, output);
    else this.outputEditor.update(output)
  }

  /*
  toggleNGSI($event) {
    console.debug(this.NGSI)
    console.debug($event)
    $event == "true" || $event == true ?
      this.NGSI = true :
      this.NGSI = false
    console.debug(this.NGSI)
    console.debug($event)
  }*/

  getAllNestedProperties(obj) {

    let properties = {};

    if (obj.allOf)
      for (let oneOf of obj.allOf)
        if (oneOf.properties)
          return this.getAllNestedProperties(oneOf)

    if (obj.properties)
      for (let key in obj.properties)
        if (typeof obj.properties[key] == 'object' || (obj.properties[key] && obj.properties[key].properties))
          properties[key] = this.getAllNestedProperties(obj.properties[key]);
        else
          properties[key] = "";
    else
      return ""
    return properties;
  }

  //skipArrays:Ignore the array part
  //keepObjKeys:Whether to keep the parent object keys

  getKeys(obj, keepObjKeys, skipArrays, keys = [], scope = []) {

    if (Array.isArray(obj)) {
      /*if (!skipArrays) scope.push('[' + obj.length + ']');
      obj.forEach((o) => this.getKeys(o, keepObjKeys, skipArrays, keys, scope), keys);*/
    } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
      Object.keys(obj).forEach((k) => {
        if ((!Array.isArray(obj[k]) && !(typeof obj[k] === 'object')) || keepObjKeys) {
          let path = scope.concat(k).join('.').replace(/\.\[/g, '[');
          if (!keys.includes(path)) keys.push(path);
        }
        this.getKeys(obj[k], keepObjKeys, skipArrays, keys, scope.concat(k));
      }, keys);
    }
    return keys;
  }

  onUpdateInputType(event) {

    const divJsonElement = document.getElementById('json-input');
    const divCSVElement = document.getElementById('csv-input');

    this.inputType = event

    if (event === 'csv') {
      divCSVElement.style.display = 'block';
      divJsonElement.style.display = 'none';
    } else {
      divCSVElement.style.display = 'none';
      divJsonElement.style.display = 'block';
    }
  }

  onUpdatePathForDataMap(event) {

    mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), event);
    this.setMapEditor(false);
  }

  updateMapper(path, value, map, mapperEditor) {
    console.debug(mapGl)
    console.debug(map)
    map[path] = value
    mapperEditor.update(map)
  }

  setMapEditor(justOptions) {

    let updateMapper = this.updateMapper
    var dialogService = this.dialogService;

    //let map = this.map
    mapGl = this.map
    mapperEditor = this.mapperEditor

    this.options2 = {
      mode: 'tree',
      modes: ['tree', 'code', 'view', 'preview'], // allowed modes
      onModeChange: function (newMode, oldMode) {
      },

      onCreateMenu: function (items, node) {
        const path = node.path

        // log the current items and node for inspection
        //console.log('items:', items, 'node:', node)

        var selectPath = path;
        function pathToMap() {
          //this.m = mOptions
          console.debug(mapOptionsGl)
          dialogService
            .open(DialogDataMapComponent, {
              context: { mapOptions: mapOptionsGl, selectPath: selectPath, map: mapGl },
            }).onClose.subscribe((value) => {
              updateMapper(selectPath, value[0], mapGl, mapperEditor)// value[1] is the map
            });
        }

        if (path) {
          // items.push instead items = if you want to maintain other menu options
          items = [{
            text: 'Map', // the text for the menu item
            title: 'Put the map with source', // the HTML title attribute
            className: 'example-class',
            click: pathToMap // the function to call when the menu item is clicked
          }]
        }

        items.forEach(function (item, index, items) {
          if ("submenu" in item) {
            // if the item has a submenu property, it is a submenu heading
            // and contains another array of menu items. Let's colour
            // that yellow...
            items[index].className += ' submenu-highlight'
          } else {
            // if it's not a submenu heading, let's make it colorful
            items[index].className += ' rainbow'
          }
        })

        // note that the above loop isn't recursive, so it only alters the classes
        // on the top-level menu items. To also process menu items in submenus
        // you should iterate through any "submenu" arrays of items if the item has one.

        // next, just for fun, let's remove any menu separators (again just at the
        // top level menu). A menu separator is an item with a type : 'separator'
        // property
        items = items.filter(function (item) {
          return item.type !== 'separator'
        })

        // finally we need to return the items array. If we don't, the menu
        // will be empty.
        return items
      }
    };

    if (!this.mapperEditor && !justOptions) this.mapperEditor = new JSONEditor(this.mapperEditorContainer, this.options2, this.map);
    else if (!justOptions) this.mapperEditor.update(this.map)
  }

  buildSnippet() {
    let source = JSON.parse(this.sourceEditor.getText())

    if (source[this.selectedPath])
      source = source[this.selectedPath]

    let body = this.isNew ?
      {
        mapID: this.adapter.adapterId
      }
      :
      {
        sourceDataType: this.inputType,
        sourceDataURL: this.sourceDataURL,
        sourceData: this.sourceDataURL || this.selectedSource ? undefined : this.inputType != "json" ? this.csvSourceData : source,
        sourceDataID: this.selectedSource,
        dataModelID: this.selectedSchema == "---select schema---" ? undefined : this.selectedSchema,
        mapData: JSON.parse(this.mapperEditor.getText()),
        dataModel: this.selectedSchema == "---select schema---" && !this.dataModelURL ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: {
          delimiter: this.separatorItem,
          NGSI_entity: this.NGSI
        }
      }
    return "curl --location '" + this.config.data_model_mapper.default_mapper_url + "' --header 'Content-Type: application/json' --data '" + JSON.stringify(body) + "'"
  }

  saveAsFile(): void {
    /*
    this.windowService.open(
      this.contentTemplate
    ).onClose.subscribe((content) => {
      this.saveFile(this.name, this.adapterId);
     });*/


    this.dialogService.open(ExportFileComponent).onClose.subscribe((content) => {
      this.saveFile(content == "file" ? {
        map: JSON.parse(this.mapperEditor.getText()),
        dataModel: this.schemaJson
      }
        :
        this.buildSnippet()
      );
    })
  }

  async saveFile(model): Promise<void> {
    //let model =
    const filename = "exportedFile.json",
      blob = new Blob([model], {
        type: 'application/json;charset=utf-8',
      });

    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

      a.dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: false,
        })
      );
    }
  }

  saveAdapter() {
    let source = JSON.parse(this.sourceEditor.getText())

    if (source[this.selectedPath])
      source = source[this.selectedPath]
    console.debug(this.NGSI)
    this.dialogService.open(CreateMapComponent, {
      context: {
        save: true,
        jsonMap: JSON.parse(this.mapperEditor.getText()),
        schema: JSON.parse(this.schemaEditor.getText()),//(!this.selectedSchema || this.selectedSchema == "---select schema---") && !this.dataModelURL ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: {
          delimiter: this.separatorItem,
          NGSI_entity: this.NGSI
        },
        sourceDataType: this.inputType,
        sourceDataURL: this.sourceDataURL,
        sourceDataID: this.selectedSource,
        dataModelURL: this.dataModelURL,
        dataModelID: this.selectedSchema && this.selectedSchema != "---select schema---" ? this.selectedSchema : undefined,
        sourceData: this.inputType != "json" ? this.csvSourceData : source // this.sourceDataURL || this.selectedSource ? undefined : this.inputType != "json" ? this.csvSourceData : source
        , schemaSaved: this.savedSchema,
        sourceSaved: this.savedSource
      }
    }).onClose.subscribe(async (adapter) => {
      if (adapter) {
        console.log(adapter)
        this.adapter = adapter;
        this.isNew = true
        this.maps.push({
          id: adapter.adapterId,
          name: adapter.name,
          description: adapter.description,
          status: adapter.status,
          map: JSON.parse(this.mapperEditor.getText()),
          dataModel: this.schemaJson
        })
        this.selectMap = adapter.adapterId
        this.savedSchema = adapter.saveSchema
        this.savedSource = adapter.saveSource
      }
    });
  }

  async mapChanged($event) {
    if ($event && $event != "---select map---") {
      let mapSettings = this.maps.filter(filteredMap => filteredMap.id == $event)[0]
      this.savedSource = await this.dmmService.getSource($event),
      this.savedSchema = await this.dmmService.getSchema($event)

      //if (sourceByID) {
        //this.savedSource = sourceByID
        //console.debug("SOUCE FOUND")
      //}
      //if (schemaByID) {
        //this.savedSchema = schemaByID
        //console.debug("SCHEMA FOUND")
     // }

      //console.debug(sourceByID)
      //console.debug(schemaByID)

      this.schemaJson = [
        mapSettings.dataModel
      ];
      this.onUpdateInputType(mapSettings?.sourceDataType)
      this.NGSI = mapSettings?.config?.NGSI_entity
      this.separatorItem = mapSettings?.config?.delimiter

      if (mapSettings.sourceDataID && !mapSettings.sourceData) {
        this.selectedSource = mapSettings.sourceDataID
        mapSettings.sourceData = this.source()
      }
      else if (mapSettings.sourceDataURL && !mapSettings.sourceData) {
        this.sourceDataURL = mapSettings.sourceDataURL
        if (this.selectedSource) this.selectedSource = undefined
        mapSettings.sourceData = await this.dmmService.getRemoteSource(mapSettings.sourceDataURL, mapSettings.sourceDataType);
      }
      if (mapSettings.sourceDataType == "json") {
        //this.sourceJson = this.source();
        this.sourceEditor.update(mapSettings.sourceData)
        mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
        this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), '')
        this.onUpdatePathForDataMap("")
      }
      else
        this.csvSourceData = mapSettings.sourceData

      this.map = mapSettings.map
      mapGl = this.map
      this.adapter = {}
      this.adapter.adapterId = mapSettings.id
      this.name = mapSettings.name
      this.adapter.description = mapSettings.description
      this.adapter.status = mapSettings.status
      this.isNew = true
      this.mapperEditor.update(this.map)
      this.selectedSchema = "---select schema---"
      if (mapSettings.dataModel) this.schemaEditor.update(mapSettings.dataModel)
    }
  }

  updateCSVTable() {
    try {
      this.displayCSV(this.csvSourceData, this.csvtable, this.separatorItem)
      mapOptionsGl = this.csvSourceData.slice(0, this.csvSourceData.indexOf("\n")).split(this.separatorItem)
      this.setMapEditor(true);
    }
    catch (error) {
      if (this.inputType != "json")
        //console.log(error.message)
        //else
        console.error(error)
    }
  }

  import(field, typeSource: string): void {
    this.typeSource = typeSource;
    this.dialogService
      .open(DialogImportComponent, field == "map" ?
        {
          context: { map: true },
        }
        :
        {
          context: { type: typeSource },
        })
      .onClose.subscribe((result: { content: string; source: string; format: string; mapSettings }) => {
        if (result.mapSettings) {
          result.mapSettings = JSON.parse(result.mapSettings)
          this.schemaJson = [
            result.mapSettings.dataModel
          ];
          this.map = result.mapSettings.map
          mapGl = this.map
          this.mapperEditor.update(this.map)
        }
        else if (result && result.content) {
          this.sourceRef = result?.source;
          this.sourceRefFormat = result?.format;
          if (typeSource == 'csv') {
            if (this.sourceRefFormat == "url") {
              this.sourceDataURL = result.source
              if (this.selectedSource) this.selectedSource = undefined
            }
            this.csvSourceData = result.content;
            this.displayCSV(this.csvSourceData, this.csvtable, this.separatorItem);
            mapOptionsGl = this.csvSourceData.slice(0, this.csvSourceData.indexOf("\n")).split(this.separatorItem);

          } else if (field == 'source') {
            if (this.sourceRefFormat == "url") {
              this.sourceDataURL = result.source
              if (this.selectedSource) this.selectedSource = undefined
            }
            if (!this.sourceEditor)
              this.sourceEditor = new JSONEditor(this.sourceEditorContainer, {
                mode: 'view',
                modes: ['view', 'code'], // allowed modes
                onModeChange: function (newMode, oldMode) { },
              }, JSON.parse(result.content));

            else
              this.sourceEditor.setText(result.content);

            mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
            this.paths = this.selectMapJsonOptions(result.content, '')

            this.onUpdatePathForDataMap("")
          }
          else if (field == 'schema') {
            if (this.sourceRefFormat == "url") {
              this.dataModelURL = result.source
              this.selectedSchema = "---select schema---"
            }
            this.schemaEditor.update(JSON.parse(result.content))
            this.setSchemaFromFile(JSON.parse(result.content))
          }
        }
      });
  }

  selectMapJsonOptions(content: string, path: string): string[] {
    return this.getKeys(_.get(JSON.parse(content), path + '[0]', JSON.parse(content)), true, true)
  }

  displayCSV(csvData: string, element: HTMLElement, separator: string) {
    // Split the CSV data into an array of rows
    var divElement = document.createElement('div');
    divElement.style.overflowY = "auto";
    divElement.style.height = "200px";

    this.rows = csvData.split('\n');

    // Create a table element
    var table = document.createElement('table');
    table.className = 'table table-striped';

    // Loop through each row in the CSV data
    this.rows.forEach((rowData, index) => {
      // Split the row into an array of cells
      const cells = rowData.split(separator);

      // Create a table row element

      const row = document.createElement(index === 0 ? 'thead' : 'tr');

      // Loop through each cell in the row and add it to the table cell element
      cells.forEach((cellData) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        cell.textContent = cellData;
        row.appendChild(cell);
      });

      // Add the row to the table
      table.appendChild(row);
    });

    // Add the table to the document

    divElement.appendChild(table);
    element.textContent = ""
    element.appendChild(divElement);
  }
}


