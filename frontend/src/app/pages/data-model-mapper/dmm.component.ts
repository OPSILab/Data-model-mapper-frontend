import { AppConfig } from './../../model/appConfig';
import { Component, OnInit, TemplateRef, ViewChild, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { DMMService } from './dmm.service';
import {
  NbDialogRef,
  NbDialogService,
  NbWindowService,
} from '@nebular/theme';
import * as _ from "lodash"
import * as JSONEditor from '../../../../node_modules/jsoneditor/dist/jsoneditor.js';
import { DOCUMENT } from '@angular/common';
import { DialogImportComponent } from './dialog-import/dialog-import.component';
import { DialogDataMapComponent } from './dialog-dataMap/dialog-dataMap.component';
import { CreateMapComponent } from './create-map/create-map.component';
import { ExportFileComponent } from './export-file/export-file.component';
import { ErrorDialogAdapterService } from '../error-dialog/error-dialog-adapter.service';
import { ActivatedRoute } from '@angular/router';
import { NgxConfigureService } from 'ngx-configure';
import { TransformComponent } from '../home/transform/transform.component';
import editor from './mapperEditor'
import { DialogComponent } from './create-map/dialog/dialog.component';

let mapOptionsGl, mapGl = "Set your mapping fields here"//, mapperEditor

function schemaEditorMode(newMode) {
  console.debug(newMode)
  console.debug(newMode == "code")
  if (newMode == "code") schemaEditorCodeMode = true
  //editor.toggleSchemaMode = false
}

let schemaEditorCodeMode = false

function sourceEditorMode(newMode) {
  console.debug(newMode)
  console.debug(newMode == "code")
  if (newMode == "code") sourceEditorCodeMode = true
  //editor.toggleSourceMode = false
}

let alwaysCode = false

let sourceEditorCodeMode = false

function getEditorCodeMode(editor) {
  if (alwaysCode)
    return true
  else if (editor == "source")
    return sourceEditorCodeMode
  else if (editor == "schema")
    return schemaEditorCodeMode
  else throw new Error("No editor provided")
}

//let map = {}, mapperEditor, mapOptions: string[]
@Component({
  selector: 'app-root',
  templateUrl: './dmm.component.html',
  styleUrls: ['./dmm.component.scss'],
})

export class DMMComponent implements OnInit, OnChanges {

  inputID
  map
  backendDown
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
  emptySource
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
  schemaJson;
  outputEditor: any;
  outputEditorOptions: any;
  sourceJson: any;
  schemaFromFile
  selectedPath: any;
  selectMap
  schemaOrMap = "schema"
  name
  dialog = false
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
  oldMap: any;
  configEditorContainer: HTMLElement;
  configEditor: any;
  transformSettings: any;
  tempSchema: any;
  schemaRef: string;
  schemaRefFormat: string;
  sourceOptions: any;
  schemaOptions: any;
  importedSchema: any;
  importedSource: any;
  openDialog = editor.openDialog
  //ref

  constructor(
    @Inject(DOCUMENT) public document: Document,
    protected dialogService: NbDialogService,
    public windowService: NbWindowService,
    public errorService: ErrorDialogAdapterService,
    public dmmService: DMMService,
    public route: ActivatedRoute,
    public configService: NgxConfigureService,
    //public ref : any
    //public ref: NbDialogRef<any>,
  ) {
    this.config = configService.config as AppConfig;
  }

  toggleView() {
    this.flipped = !this.flipped;
  }

  test(){
    this.dialogService.open(DialogComponent)
  }

  openConfirmDialog($event) {
    console.debug($event)
    if ($event) {
      this.dialogService.open(DialogComponent, {
        context: {
          message: "Suca?"
        }
      }).onClose.subscribe((suca) => { console.debug("suca", suca) })
    }
  }

  sourceEditorMode = sourceEditorMode

  updateMap() {
    mapGl = this.map
  }

  fixBrokenPageBug() {
    document.getElementsByTagName('html')[0].className = ""
  }

  updateRecord() {
    let type = this.inputType
    let source = JSON.parse(this.sourceEditor.getText())

    //if (source[this.selectedPath])
    //source = source[this.selectedPath]

    this.dialogService.open(CreateMapComponent, {
      context: {
        value: this.adapter,
        name: this.name,
        update: true,
        path: this.selectedPath,
        sourceDataType: type,
        jsonMap: JSON.parse(editor.mapperEditor.getText()),
        schema: this.differences(this.importedSchema, JSON.parse(this.schemaEditor.getText())) ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: this.transformSettings,
        sourceDataURL: this.sourceDataURL,
        sourceDataID: this.selectedSource,
        dataModelURL: this.dataModelURL,
        dataModelID: this.selectedSchema && this.selectedSchema != "---select schema---" ? this.selectedSchema : undefined,
        sourceData: this.differences(this.importedSource, JSON.parse(this.sourceEditor.getText())) ? this.inputType == "json" ? source : this.csvSourceData : undefined,
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

  getSchema() {
    //console.debug(this.schemaEditor.getText())
    //console.debug(typeof this.schemaEditor.getText())
    if (this.tempSchema) return this.tempSchema
    this.schemaJson = this.schemaEditor.getText() ? JSON.parse(this.schemaEditor.getText()) : { info: "Set your schema here" }
    return this.schemaJson
  }

  parsed = false

  async refParse(subObj) {
    if (!subObj) this.parsed = false
    //console.debug(subObj)
    let obj2 = subObj ? subObj : this.tempSchema || this.schemaJson
    for (let key in obj2)
      if (typeof obj2[key] == "object" || Array.isArray(obj2[key]))
        await this.refParse(obj2[key])
      else if (key.startsWith("$ref")) {
        //console.debug("ref found");
        this.parsed = true
      }
    if (!subObj && !this.parsed) {
      //console.debug("return obj", this.schemaJson);
      return this.tempSchema || this.schemaJson
    }
    else return await this.dmmService.refParse(this.tempSchema || this.schemaJson)
  }

  generateMapper(schemaParsed) {

    if (this.map) {
      this.map = JSON.parse(editor.mapperEditor.getText())
      this.oldMap = JSON.parse(JSON.stringify(this.map))
    }
    try {
      this.map = this.getAllNestedProperties(schemaParsed);
      //console.debug(this)
      try {
        if (this.map && this.oldMap) this.compareMaps(this.oldMap, this.map)
      }
      catch (error) {
        this.handleError(error, false, false)
      }
      this.generate_NGSI_ID()
      mapGl = this.map
      editor.mapperEditor.update(this.map)
      this.selectMap = "---select map---"
    }
    catch (error) {
      this.handleError(error, false, false)
      if (error?.status == 0 || error?.error?.status == 0) {
        error.statusText = undefined
        error.message = error.error.message = "Unable to import schema"
      }
      this.errorService.openErrorDialog(error)
      this.map = { "error": "Some errors occurred during generating map object" }
      this.schemaJson = {
        "info": "set your schema here"
      }
    }
  }

  async schemaChanged($event, from) {
    let errors
    if ($event && $event != "---select schema---") {
      if (this.dataModelURL && from != "url") {
        this.dataModelURL = undefined
        console.debug(this.dataModelURL)
        schemaEditorCodeMode = false
      }
      if (this.selectedSchema)
        this.schemaJson = this.selectFilteredSchema();
      //console.debug(this.schemaJson)
      if (!this.schemaJson) {
        this.schemaJson = {
          "info": "Set your schema here"
        }
      }

      //
      try {
        //this.generateMapper(await this.refParse(false))
        console.debug(this)
        this.schemaJson = await this.refParse(false)
        this.selectedDataModel = this.schemaJson
        console.debug(this)
        this.schemaEditor.update(this.selectedDataModel)
      }
      catch (error) {
        errors = true
        this.handleError(error, false, false)
        if (error?.status == 0 || error?.error?.status == 0) {
          error.statusText = undefined
          error.message = error.error.message = "Unable to import schema"
        }
        this.errorService.openErrorDialog(error)
        this.map = { "error": "Some errors occurred during generating map object" }
        this.schemaJson = {
          "info": "set your schema here"
        }

      }
      if (typeof $event == 'string' && !errors) {
        schemaEditorCodeMode = false
        this.importedSchema = JSON.parse(this.schemaEditor.getText())
      }
      else if (!errors)
        this.importedSchema = JSON.parse(this.schemaEditor.getText())
      this.tempSchema = undefined
    }
  }

  sourceChanged($event) {

    //if ($event && $event != "---select schema---") {
    try {
      if (this.selectedSource) {
        if (this.sourceDataURL) this.sourceDataURL = undefined
        if (this.inputType == "json") {
          this.sourceJson = this.source();
          this.sourceEditor.update(this.sourceJson)
          if (this.selectedPath != "" && !this.sourceJson[this.selectedPath]) this.selectedPath = ""
          mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
          this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), '')
          this.onUpdatePathForDataMap("")
          this.importedSource = JSON.parse(this.sourceEditor.getText())
        }
        else {
          this.csvSourceData = this.source()
          this.importedSource = this.csvSourceData
        }
        sourceEditorCodeMode = false
      }
    }
    catch (error) {
      this.handleError(error, true, "Error during importing source")
    }
  }

  async reset() {
    schemaEditorCodeMode = false
    sourceEditorCodeMode = false
    this.adapterId = undefined
    this.dataModelURL = undefined
    this.inputID = undefined
    this.name = undefined
    this.inputType = undefined
    this.adapter = {}
    this.parsed = false
    this.partialCsv = undefined
    this.paths = []
    this.rows = undefined
    this.savedSchema = undefined
    this.savedSource = undefined
    this.selectedSource = undefined
    this.schemaFromFile = undefined
    this.schemaOrMap = "schema"
    this.typeSource = undefined
    this.tempSchema = undefined
    this.tempMap = undefined
    this.sourceRef = ''
    this.sourceRefFormat = undefined
    this.schemaRef = '';
    this.schemaRefFormat = undefined;
    this.isNew = false
    this.selectedPath = undefined
    this.selectedSchema = "---select schema---"
    this.selectedDataModel = {
      "info": "set your schema here"
    }
    let preview = {
      "preview": "set the source, set the json map and click preview to see the output json preview"
    }
    this.sourceJson = [{
      "info": "set your source json here"
    }]
    this.map = {
      "set a field from the output schema field list": "set a field from the source input"
    }
    this.oldMap = undefined
    this.sourceEditor.update(this.sourceJson)
    editor.mapperEditor.update(this.map)
    this.schemaEditor.update(this.selectedDataModel)
    this.outputEditor.update(preview)
    this.selectMap = "---select map---"
    this.csvSourceData = ""
    this.displayCSV(this.csvSourceData, this.csvtable, this.separatorItem)
    await this.resetConfigSettings()
    this.onUpdatePathForDataMap("")
  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.debug(changes);
  }

  async setSchemaFromFile($event) {
    this.schemaFromFile = $event
    this.schemaJson =
      this.schemaFromFile

    //console.debug("THIS SCHEMA JSON")
    //console.debug(this.schemaJson)
    this.map = this.getAllNestedProperties(await this.dmmService.refParse(this.schemaJson));
    mapGl = this.map
    //console.debug("THIS MAP")
    //console.debug(this.map)
    editor.mapperEditor.update(this.map)
  }

  async ngOnInit(): Promise<void> {

    schemaEditorCodeMode = false

    editor.mapperEditor = undefined

    this.sourceEditorContainer = this.document.getElementById('jsoneditor');
    this.configEditorContainer = this.document.getElementById('configEditor');
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
      this.handleError(error, false, false)
      if (error.status == 0 || error.error.status == 0) {
        error.statusText = undefined
        error.message = error.error.message = "Unable to reach server"
        this.backendDown = true
      }
      this.errorService.openErrorDialog(error)
    }

    this.sourceOptions = {
      mode: 'view',
      modes: ['view', 'code'], // allowed modes
      onModeChange: function (newMode, oldMode) { sourceEditorMode(newMode) },
    };

    this.schemaOptions = {
      mode: 'view',
      modes: ['view', 'code'], // allowed modes
      onModeChange: function (newMode, oldMode) { schemaEditorMode(newMode) },
    };

    this.sourceJson = [{
      "info": "set your source json here"
    }]

    this.selectedDataModel = {
      "info": "set your schema here"
    }

    let preview = {
      "preview": "set the source, set the json map and click preview to see the output json preview"
    }

    this.map = {
      "set a field from the output schema field list": "set a field from the source input"
    }

    this.sourceEditor = new JSONEditor(this.sourceEditorContainer, this.sourceOptions, this.sourceJson);

    this.schemaEditor = new JSONEditor(this.schemaEditorContainer, this.schemaOptions, this.selectedDataModel)

    await this.resetConfigSettings()

    //console.debug(this)

    this.outputEditorOptions = {
      mode: 'view',
      modes: ['view', 'preview'], // allowed modes
      onModeChange: function (newMode, oldMode) { },
    };

    if (this.selectedSchema)
      this.schemaJson =
        this.selectFilteredSchema()
        ;

    this.setMapEditor(false);

    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, preview);
    else
      this.outputEditor.update(preview)

    if (this.route.snapshot.params['inputID'] as string || this.inputID) {
      if (this.route.snapshot.params['inputID'] as string) this.inputID = this.route.snapshot.params['inputID'] as string;
      this.selectMap = this.inputID
      await this.mapChanged(this.inputID, false)
      if (this.inputType == "csv" && !this.emptySource) this.updateCSVTable()
    }
  }

  selectFilteredSchema() {
    try {
      //console.debug(this)
      return this.schemas.filter(filteredSchema => filteredSchema.id == this.selectedSchema)[0].dataModel
    }
    catch (error) {
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
      return this.getSchema()
    }
  }

  source() {
    return this.sources.filter(filteredSource => filteredSource.id == this.selectedSource)[0].source || this.sources.filter(filteredSource => filteredSource.id == this.selectedSource)[0].sourceCSV
  }

  async loadMapperList() {
    try {
      this.maps = await this.dmmService.getMaps();
    }
    catch (error) {
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
      this.maps = []
      throw error
    }
  }

  async loadSchemaList() {
    try {
      this.schemas = await this.dmmService.getSchemas();
    }
    catch (error) {
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
      this.schemas = []
      throw error
    }
  }

  async loadSourceList() {
    try {
      this.sources = await this.dmmService.getSources();
    }
    catch (error) {
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
      this.sources = []
      throw error
    }
  }

  updateConfig($event) {
    if ($event) this.transformSettings.delimiter = $event
    this.configEditor.update(this.transformSettings)
  }

  async resetConfigSettings() {
    this.confirmMapping()
    try {
      this.transformSettings = await this.dmmService.getConfig()
    }
    catch (error) {
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
      this.transformSettings = await this.dmmService.getBackupConfig()
    }
    if (this.transformSettings.backup)
      this.transformSettings = this.transformSettings.backup
    if (!this.transformSettings.rowEnd)
      this.transformSettings.rowEnd = 1000
    !this.configEditor ?
      this.configEditor = new JSONEditor(this.configEditorContainer, this.options2, this.transformSettings)
      :
      this.configEditor.update(this.transformSettings)
    this.separatorItem = this.transformSettings.delimiter
  }

  async testAdapter() {
    this.updateConfigSettings()
    let output
    try {
      let m = JSON.parse(editor.mapperEditor.getText())
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
          .concat(this.rows[1] ? "\r\n" : '')
          .concat(this.rows[1] || '')
          .concat(this.rows[2] ? "\r\n" : '')
          .concat(this.rows[2] || '')
          .concat(this.rows[3] ? "\r\n" : '')
          .concat(this.rows[3] || '')

      output = await this.dmmService.test(this.inputType, this.inputType == "csv" ? this.partialCsv : source, m, this.schemaJson, this.transformSettings)
    }
    catch (error) {
      if (!output)
        output = !error.status ? { "error": "Service unreachable" } : error.error
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
    }
    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, output);
    else this.outputEditor.update(output)
  }

  async transform() {
    this.updateConfigSettings()
    let output
    try {
      let m = JSON.parse(editor.mapperEditor.getText())
      m["targetDataModel"] = "DataModelTemp"
      let source = JSON.parse(this.sourceEditor.getText())

      if (source[this.selectedPath])
        source = source[this.selectedPath]

      output = await this.dmmService.test(this.inputType, this.inputType == "csv" ? this.csvSourceData : source, m, this.schemaJson, this.transformSettings)
    }
    catch (error) {
      if (!output)
        if (!error.status)
          output = { "error": "Service unreachable" }
        else if (error.status == 413)
          output = { "error": "Request too large" }
        else
          output = error.error
      this.handleError(error, false, false)
      //this.errorService.openErrorDialog(error)
    }
    if (!this.outputEditor)
      this.outputEditor = new JSONEditor(this.outputEditorContainer, this.outputEditorOptions, output);
    else this.outputEditor.update(output)
  }

  getAllNestedProperties(obj) {

    let properties = {};

    if (obj.allOf)
      for (let oneOf of obj.allOf)
        if (oneOf.properties)
          obj.properties = { ...obj.properties, ...oneOf.properties }
    /*
        if (obj.required)
          for (let key of obj.required)
            if (!obj.properties[key])
              obj.properties[key] = true

        if (obj.anyOf)
          for (let oneOf of obj.anyOf)
            if (oneOf.required)
              for (let key of oneOf.required)
                if (!obj.properties[key])
                  obj.properties[key] = true

       //console.debug(obj.properties)*/

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

  compareMaps(oldMap, newMap) {
    //console.debug(JSON.parse(JSON.stringify(oldMap)), JSON.parse(JSON.stringify(newMap)))
    for (let key in newMap)
      if (oldMap && oldMap[key])
        if (typeof newMap[key] == "object" || Array.isArray(newMap[key]))
          this.compareMaps(oldMap[key], newMap[key])
        else //if (oldMap[key] && (typeof oldMap[key] == "object" || Array.isArray(typeof oldMap[key])))
          newMap[key] = JSON.parse(JSON.stringify(oldMap[key]))
  }

  differences(object1, object2) {
    return JSON.stringify(object1) != JSON.stringify(object2)
  }

  //skipArrays:Ignore the array part
  //keepObjKeys:Whether to keep the parent object keys

  getKeys(obj, keepObjKeys, skipArrays, keys = [], scope = []) {
    console.debug(obj)
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
    console.debug(keys)
    return keys;
  }

  keys = []

  getKeys_2(obj, key, path) {
    if (key && key != "")
      obj = obj[key]
    if (typeof obj == "object" || Array.isArray(obj))
      for (let subKey in obj)
        if (typeof obj[subKey] == "object" || Array.isArray(obj[subKey]))
          this.getKeys_2(JSON.parse(JSON.stringify(obj)), subKey, path ? path + "." + subKey : subKey)
        else this.keys.push(path + "." + subKey)
    else this.keys.push(path)
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

    //console.debug(event)
    this.confirmMapping()
    this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), "")
    mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), event);
    if (!mapOptionsGl[0])
      mapOptionsGl[0] = "---no keys for selected path---"
    this.setMapEditor(true);
  }

  tempMap = { temp: undefined }

  deepInPath(path, value, map) {
    //for (let sub of path)
    if (path[1]) {
      let sub = path.shift()
      map[sub] = this.deepInPath(path, value, map[sub])// = this.deepInPath(path, value, map[sub])
      return map[sub]
    }
    else {
      map[path] = value
      return map
    }
  }

  updateMapper(path, value, map) {//, mapperEditor) {
    const deepInPath = (path, value, map) => {
      //for (let sub of path)
      if (path[1]) {
        let sub = path.shift()
        map[sub] = deepInPath(path, value, map[sub])// = this.deepInPath(path, value, map[sub])
        return map[sub]
      }
      else {
        map[path] = value
        return map
      }
    }
    //console.debug(mapGl)
    //console.debug(map)
    let fixedPath = ""
    //console.debug(path)
    if (path[1]) {
      map[path[0]] = deepInPath(path, value, map)
    }
    else map[path] = value
    try {
      editor.mapperEditor.update(map)
    }
    catch (error) {
      this.handleError(error, false, false)
      //editor.mapperEditor.update(map)
    }
  }

  setMapEditor(justOptions) {

    let updateMapper = this.updateMapper
    var dialogService = this.dialogService;

    //let map = this.map
    mapGl = this.map
    //editor.mapperEditor = editor.mapperEditor
    try {
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
          //console.debug(selectPath)
          function pathToMap() {
            //this.m = mOptions
            //console.debug(mapOptionsGl)
            dialogService
              .open(DialogDataMapComponent, {
                context: { mapOptions: mapOptionsGl, selectPath: selectPath, map: mapGl },
              }).onClose.subscribe((value) => {
                let editor = require('./mapperEditor')
                if (value)
                  updateMapper(selectPath, value ? value[0] : "", mapGl)//, mapperEditor)// value[1] is the map
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
    }
    catch (error) {
      this.handleError(error, false, false)
      console.error("Error during map setting set")
    }

    //if (!editor.mapperEditor && !justOptions) editor.mapperEditor = new JSONEditor(this.mapperEditorContainer, this.options2, this.map);
    if (!editor.mapperEditor && !justOptions) editor.mapperEditor = new JSONEditor(this.mapperEditorContainer, this.options2, this.map);
    else if (!justOptions) editor.mapperEditor.update(this.map)
  }

  buildSnippet() {
    //console.debug(this)
    let source = JSON.parse(this.sourceEditor.getText())

    //if (source[this.selectedPath])
    //source = source[this.selectedPath]

    let body = this.isNew ?
      {
        mapID: this.adapter.adapterId
      }
      :
      {
        sourceDataType: this.inputType,
        path: this.selectedPath,
        sourceDataURL: this.sourceDataURL,
        sourceData: this.sourceDataURL || this.selectedSource ? undefined : this.inputType != "json" ? this.csvSourceData : source,
        sourceDataID: this.selectedSource,
        dataModelID: this.selectedSchema == "---select schema---" ? undefined : this.selectedSchema,
        mapData: JSON.parse(editor.mapperEditor.getText()),
        dataModel: (!this.selectedSchema || this.selectedSchema == "---select schema---") && !this.dataModelURL ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: this.transformSettings
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
    let source = JSON.parse(this.sourceEditor.getText())

    //if (source[this.selectedPath])
    //source = source[this.selectedPath]


    this.dialogService.open(ExportFileComponent).onClose.subscribe((content) => {
      this.saveFile(content == "file" ? JSON.stringify({
        sourceDataType: this.inputType,
        path: this.selectedPath,
        sourceDataURL: this.sourceDataURL,
        sourceData: this.sourceDataURL || this.selectedSource ? undefined : this.inputType != "json" ? this.csvSourceData : source,
        sourceDataID: this.selectedSource,
        dataModelID: this.selectedSchema == "---select schema---" ? undefined : this.selectedSchema,
        mapData: JSON.parse(editor.mapperEditor.getText()),
        dataModel: (!this.selectedSchema || this.selectedSchema == "---select schema---") && !this.dataModelURL ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: this.transformSettings
      })
        :
        this.buildSnippet()
      );
    })
  }

  download() {
    this.saveFile(this.outputEditor.getText())
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

  confirmMapping() {
    try {
      mapGl = this.map = JSON.parse(editor.mapperEditor.getText())
    }
    catch (error) {
      error.message == "Cannot read properties of undefined (reading 'getText')" ? console.debug() :
        this.handleError(error, false, false)
    }
  }

  handleError(error, modal, message) {
    if (modal)
      this.errorService.openErrorDialog(error)
    if (message)
      console.error(message)
    else
      console.error(error?.message || error?.error?.message || error?.statusText || error)
    console.error(error)
  }

  generate_NGSI_ID() {
    console.debug(this.transformSettings)
    if (this.transformSettings.NGSI_entity) {
      console.debug(true)
      if (!this.map[this.transformSettings.entityNameField])
        mapGl = this.map[this.transformSettings.entityNameField] = ""
      if (!this.map.targetDataModel)
        mapGl = this.map.targetDataModel = "DataModelTemp"
      editor.mapperEditor.update(this.map)
    }
    else {
      console.debug(false)
      //if (this.map[this.transformSettings.entityNameField] || typeof this.map[this.transformSettings.entityNameField] == 'string')
      mapGl = this.map[this.transformSettings.entityNameField] = undefined
      //if (this.map.targetDataModel)
      mapGl = this.map.targetDataModel = undefined
      editor.mapperEditor.update("m")
      editor.mapperEditor.update(this.map)
    }
  }

  updateConfigSettings() {
    this.confirmMapping()
    //console.debug(this.transformSettings)
    this.transformSettings = JSON.parse(this.configEditor.getText())
    this.separatorItem = this.transformSettings.delimiter
    this.generate_NGSI_ID()
  }

  saveRecord() {
    let source = JSON.parse(this.sourceEditor.getText())

    //if (source[this.selectedPath])
    //source = source[this.selectedPath]

    console.debug(this.dataModelURL)

    this.dialogService.open(CreateMapComponent, {
      context: {
        save: true,
        path: this.selectedPath,
        jsonMap: JSON.parse(editor.mapperEditor.getText()),
        schema: this.differences(this.importedSchema, JSON.parse(this.schemaEditor.getText())) ? JSON.parse(this.schemaEditor.getText()) : undefined,
        config: this.transformSettings,
        sourceDataType: this.inputType,
        sourceDataURL: this.sourceDataURL,
        sourceDataID: this.selectedSource,
        dataModelURL: this.dataModelURL,
        dataModelID: this.selectedSchema && this.selectedSchema != "---select schema---" ? this.selectedSchema : undefined,
        sourceData: this.differences(this.importedSource, JSON.parse(this.sourceEditor.getText())) ? this.inputType == "json" ? source : this.csvSourceData : undefined,
        schemaSaved: false,
        sourceSaved: false
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
          map: JSON.parse(editor.mapperEditor.getText()),
          dataModel: this.schemaJson
        })
        this.selectMap = adapter.adapterId
        this.savedSchema = adapter.saveSchema
        this.savedSource = adapter.saveSource
      }
    });
  }

  async mapChanged($event, settingsFromFile) {
    if (settingsFromFile || ($event && $event != "---select map---")) {
      let mapSettings

      if ($event && $event != "---select map---") {
        mapSettings = this.maps.filter(filteredMap => filteredMap.id == $event)[0]

        try {
          this.savedSource = await this.dmmService.getSource($event)
          this.savedSchema = await this.dmmService.getSchema($event)
        }
        catch (error) {
          this.handleError(error, false, false)
          //this.errorService.openErrorDialog(error)
        }
      }
      else mapSettings = JSON.parse(settingsFromFile)

      //console.debug(typeof settingsFromFile, mapSettings)

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

      this.onUpdateInputType(mapSettings?.sourceDataType)
      this.transformSettings = mapSettings?.config
      this.configEditor.update(this.transformSettings)
      this.separatorItem = mapSettings?.config?.delimiter

      if (mapSettings.sourceDataID && !mapSettings.sourceData && !this.emptySource) {
        this.selectedSource = mapSettings.sourceDataID
        mapSettings.sourceData = await this.source()
      }
      else if (mapSettings.sourceDataURL && !mapSettings.sourceData && !this.emptySource) {
        this.sourceDataURL = mapSettings.sourceDataURL
        if (this.selectedSource) this.selectedSource = undefined
        try {
          mapSettings.sourceData = await this.dmmService.getRemoteSource(mapSettings.sourceDataURL, mapSettings.sourceDataType);
        }
        catch (error) {
          this.handleError(error, false, false)
          this.errorService.openErrorDialog(error)
          mapSettings.sourceData = "some errors occurred when downloading remote source"
        }
      }
      if (mapSettings.dataModelID && !mapSettings.dataModel) {
        this.selectedSchema = mapSettings.dataModelID
        mapSettings.dataModel = await this.selectFilteredSchema()
        //console.debug(mapSettings.dataModel)
      }
      else if (mapSettings.dataModelURL && !mapSettings.dataModel) {
        this.dataModelURL = mapSettings.dataModelURL
        if (this.selectedDataModel) this.selectedDataModel = undefined
        try {
          mapSettings.dataModel = await this.dmmService.getRemoteSource(mapSettings.dataModelURL, "json");
        }
        catch (error) {
          this.handleError(error, false, false)
          this.errorService.openErrorDialog(error)
          mapSettings.dataModel = "Some errors occurred when downloading remote schema"
        }
      }
      this.schemaJson =
        mapSettings.dataModel // this was strangely an arrray
        ;
      if (mapSettings.sourceDataType == "json" && !this.emptySource) {
        //this.sourceJson = this.source();
        if (mapSettings.path || mapSettings.path == '') this.selectedPath = mapSettings.path
        this.sourceEditor.update(mapSettings.sourceData)
        if (mapSettings.path || mapSettings.path == '') mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), mapSettings.path);
        else {
          this.selectedPath = ""
          mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
        }
        //if (mapSettings.path) this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), '')
        //else
        this.paths = this.selectMapJsonOptions(this.sourceEditor.getText(), '')
        if (mapSettings.path || mapSettings.path == '') this.onUpdatePathForDataMap(mapSettings.path)
        else this.onUpdatePathForDataMap("")
        //console.debug(this.selectedPath, mapSettings.path)
        //if (mapSettings.path)//console.debug(this.selectedPath, mapSettings.path)
      }
      else if (!this.emptySource)
        this.csvSourceData = mapSettings.sourceData

      this.map = mapSettings.map || mapSettings.mapData
      mapGl = this.map
      this.adapter = {}
      if (mapSettings.id) this.adapter.adapterId = mapSettings.id
      if (mapSettings.name) this.name = mapSettings.name
      if (mapSettings.description) this.adapter.description = mapSettings.description
      if (mapSettings.status) this.adapter.status = mapSettings.status
      if (this.adapter.adapterId) this.isNew = true
      editor.mapperEditor.update(this.map)
      this.selectedSchema = "---select schema---"
      this.selectedSource = undefined
      console.debug(this.selectedSource)
      if (mapSettings.dataModel) this.schemaEditor.update(mapSettings.dataModel)
      sourceEditorCodeMode = schemaEditorCodeMode = false
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
        this.handleError(error, false, false)
    }
  }

  import(field, typeSource: string): void {
    this.typeSource = typeSource;
    this.dialogService
      .open(DialogImportComponent, field == "map" ? { context: { map: true } } : { context: { type: typeSource } })
      .onClose.subscribe(async (result: { content: string; source: string; format: string; mapSettings }) => {
        if (result?.mapSettings)
          this.mapChanged(false, result.mapSettings)
        else if (result && result?.content) {
          if (typeSource == 'csv') {
            this.sourceRef = result?.source;
            this.sourceRefFormat = result?.format;
            if (this.sourceRefFormat == "url")
              this.sourceDataURL = result.source
            this.csvSourceData = result.content;
            this.displayCSV(this.csvSourceData, this.csvtable, this.separatorItem);
            mapOptionsGl = this.csvSourceData.slice(0, this.csvSourceData.indexOf("\n")).split(this.separatorItem);
            if (this.selectedSource) this.selectedSource = undefined
            console.debug(sourceEditorCodeMode)
            sourceEditorCodeMode = true
            this.importedSource = this.csvSourceData
          }
          else if (field == 'source') {
            this.sourceRef = result?.source;
            this.sourceRefFormat = result?.format;
            if (this.sourceRefFormat == "url") {
              this.sourceDataURL = result.source
              if (this.selectedSource) this.selectedSource = undefined
            }
            if (!this.sourceEditor) {
              this.sourceEditor = new JSONEditor(this.sourceEditorContainer, this.sourceOptions, JSON.parse(result.content));
              this.importedSource = JSON.parse(result.content)
            }
            else
              try {
                this.sourceEditor.setText(result.content);
                if (this.selectedSource) this.selectedSource = undefined
                sourceEditorCodeMode = true
                this.importedSource = JSON.parse(result.content)
              }
              catch (error) {
                this.handleError(error, false, false)
                this.sourceEditor.update({ message: "you must import a valid json" })
              }

            try {
              mapOptionsGl = this.selectMapJsonOptions(this.sourceEditor.getText(), "");
              this.paths = this.selectMapJsonOptions(result.content, '')
            }
            catch (error) {
              this.handleError(error, false, false)
            }

            this.onUpdatePathForDataMap("")
          }
          else if (field == 'schema') {
            this.schemaRef = result?.source;
            this.schemaRefFormat = result?.format;
            if (this.sourceRefFormat == "url") {
              this.dataModelURL = result.source
              this.selectedSchema = "---select schema---"
            }
            try {
              this.tempSchema = JSON.parse(result.content)
            }
            catch (error) {
              this.handleError(error, false, false)
              this.schemaJson = { "error": "import a valid schema" }
            }
            this.schemaChanged(this.getSchema(), "url")
          }
        }
      });
  }

  selectMapJsonOptions(content: string, path: string): string[] {/*
    this.keys = []
    this.getKeys_2(_.get(JSON.parse(content), path + '[0]', JSON.parse(content)), path, path)//this.getKeys(_.get(JSON.parse(content), path + '[0]', JSON.parse(content)), true, true)
    return this.keys*/
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


