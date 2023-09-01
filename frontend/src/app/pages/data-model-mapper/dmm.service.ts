import { Injectable } from '@angular/core';
import { NgxConfigureService } from 'ngx-configure';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../model/appConfig';
import { AdapterEntry } from '../../model/adapter/adapterEntry';

@Injectable({
  providedIn: 'root',
})
export class DMMService {


  private config: AppConfig;

  constructor(configService: NgxConfigureService, private http: HttpClient) {
    this.config = configService.config as AppConfig;

  }

  getSchemas(): any {
    return this.http.get<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/dataModels").toPromise();

  }

  getMaps(): any {
    return this.http.get<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/maps").toPromise();
  }

  getSources(): any {
    return this.http.get<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/sources").toPromise();
  }

  deleteMap(id: any) {
    return this.http.delete<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/map/" + id).toPromise();
  }

  getRemoteSource(url, type) {
    return type == "csv" ?
      this.http.get<any>(url, { responseType: 'text' as 'json' }).toPromise() :
      this.http.get<any>(url).toPromise()
  }

  saveMap(adapter: Partial<AdapterEntry>, status, description, map, schema, sourceDataType, config, sourceDataURL, dataModelURL, sourceData): any {

    /*
    if (!schema) {
      throw new Error("Schema required")
    }*/

    if (!map) {
      throw new Error("Map required")
    }

    console.debug(status, description, map, schema, sourceDataType, config, sourceDataURL, dataModelURL, sourceData)

    return this.http.post<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/map/register", {
      id: adapter.adapterId,
      name: adapter.name,
      status: status,
      description: description,
      map: map,
      dataModel: schema ? schema[0] : schema,
      sourceDataType: sourceDataType,
      config: config,
      sourceDataURL: sourceDataURL,
      dataModelURL: dataModelURL,
      sourceData: sourceData
    }).toPromise();
  }

  saveSchema(adapter: Partial<AdapterEntry>, status, description, schema): any {

    return this.http.post<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/dataModel", {
      id: adapter.adapterId,
      name: adapter.name,
      status: status,
      description: description,
      dataModel: schema[0]
    }).toPromise();
  }

  updateMap(adapter: Partial<AdapterEntry>, status, description, map, schema, sourceDataType, config, sourceDataURL, dataModelURL, sourceData): any {
    console.debug(adapter)

    if (!schema) {
      throw new Error("Schema required")
    }

    if (!map) {
      throw new Error("Map required")
    }

    console.debug(status, description, map, schema, sourceDataType, config, sourceDataURL, dataModelURL, sourceData)

    return this.http.put<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/map", {
      id: adapter.adapterId,
      name: adapter.name,
      status: status,
      description: description,
      map: map,
      dataModel: schema ? schema[0] : schema,
      sourceDataType,
      config,
      sourceDataURL,
      dataModelURL,
      sourceData
    }).toPromise();
  }

  updateSchema(adapter: Partial<AdapterEntry>, status, description, schema): any {
    console.debug(adapter)

    if (!schema) {
      throw new Error("Schema required")
    }

    return this.http.put<any[]>(this.config.data_model_mapper.default_mapper_base_url + "/dataModel", {
      id: adapter.adapterId,
      name: adapter.name,
      status: status,
      description: description,
      dataModel: schema[0] || schema
    }).toPromise();
  }


  test(type: string, source: string, mapper, schema, config): Promise<any[]> {
    return this.http.post<any[]>(this.config.data_model_mapper.default_mapper_url, {
      "sourceDataType": type,
      "sourceData": source,
      "mapData": mapper,
      "dataModel": schema,
      "config": config
    }).toPromise();
  }


}
