# SynchroniCity Data Model Mapper

## 1. Introduction

This tool enables to convert several file types (e.g. CSV, Json, GeoJson) to the different Data Models defined in the [SynchroniCity Project](https://synchronicity-iot.eu/). Source files will contain rows, JSON objects or GeoJson Features, each of them representing an object to be mapped to an NGSI entity, according to a selected SynchroniCity Data Model.

In particular, it performs following steps:

- Parse input file, by converting it into a row/object stream
- Each data chunk coming from stream is converted to an intermediate object
- By using the input JSON Map, convert the intermediate object to an entity, according to a specific target Data Model
- Validate resulting object against the JSON schema corresponding to a target Data Model. It leverages [AJV JSON Schema Validator](https://github.com/epoberezkin/ajv).
- Produce a report file with validated and unvalidated objects.
- Validated objects are sent to the configured [Orion Context Broker](https://fiware-orion.readthedocs.io/en/master/)

The tool is developed in [Node.js](https://nodejs.org) and can be started as a command line tool. Soon it will be possible to start it as a REST server

---------------------

## 2. Installation

##### Prerequisites

The tool requires NodeJS version >= 8.11 to be installed.

##### Tool Installation

Go to the root folder of the tool and type following command:

```
npm install
```

Start with:

```
node mapper
```

--------------------

## 3. Configuration

The tool configuration consists of the following parts:

- Application
- Input
- ID Pattern
- Orion Writer

#### Application configuration

The global setup is defined in the ``config.js`` file, fill and rename the ``config.template.js`` file to ``config.js``.

The config file will have the following options:

- ``env``: the execution environment. If set to production it creates logs in the corresponding files (**``/logs``** folder). Otherwise the logging messages are displayed in the console output.
- ``logLevel``: logging level for [WINSTON](https://www.npmjs.com/package/winston). It sets the verbosity of the logging. Valid values are the followings:
- ``error, warn, info, verbose, debug, silly``
- ``writers``: An array containing the names of Specific Handlers where mapped NGSI entities will be written. Only **``orionWriter``** currently is accepted. Soon will be available more writers, such as a ``fileWriter`` (under development).

#### Inputs configuration

- In order to perform the mapping process, the tool takes **three** inputs:
  1) The path of the source file containing data to be mapped (CSV, JSON or GeoJson).
  2) The JSON Map, specifying the mapping between source fields and destrination fields.
   It consists of a JSON , where the key-value pairs represent the mapping for each row container in the source file.
  3) The name of the target SynchroniCity Data Model.

These three inputs, can be specified either in the already described **config.js** file or as command line arguments.

###### Inputs configuration in config file

- ``sourceDataPath`` : The path of source file. If it is a Windows path, it **MUST** be with double backslashes (e.g. **C:\\Users\\....**).
- ``mapPath``: The path of JSON Map. See following section for creation instruction.
- ``targetDataModel``: The name of target Data Model. In detail, the Data Model Schema inside **/dataModels** folder.

###### Inputs configuration as command line arguments

In order to use inputs configuration as command line arguments, when launching the tool with ``node mapper``, append following arguments:

- ``-s, --sourceDataPath``
- ``-m, --mapPath``
- ``-d, --targetDataModel``

#### Id Pattern configuration

Following configurations are relative to fields used to generate IDs of mapped entities, according to the SynchroniCity’s Entity ID Recommendation.
For the moment, they can be specified only in the ``config.js`` file:

- ``site``: can represent a RZ, City or area that includes several different IoT deployments, services or apps (e.g., Porto, Milano, Santander, Aarhus, Andorra …).
- ``service``: represents a smart city service/application domain for example parking, garbage, environmental etc.
- ``group``: This could be optional. The group part can be used for grouping assets under the same service and/or provider (so it can be used to identify different IoT providers). It is responsibility of OS sites to maintain proper group keys.

The Entity Name (last part of ID pattern), is generated either automatically or by specifying it in a dedicated field of the JSON Map, as described in the following sections.

#### Row Range configurations

Following configuration are relative to the rows range (start, end) of the input file that will be mapped. It is useful when you want to map only a part of the input file, or, in case of huge files, when is **recommended** (in order to easily inspect the mapping and writing reports), to use a "paginated mapping", where consecutive and relatively small (2000/5000 rows) rows ranges are used.

- ``rowStart``: Row of the input file from which the mapper will start to map objects (Allowed values are integers >= 0).
- ``rowEnd`` : Last Row of the input file that will be mapped (Allowed values are integers >0 or Infinity (it indicates until the end of file).

#### Orion Writer configuration

The Orion Writer will try to create an new entity, by sending a **POST** to ``/v2/entities`` endpoint of the provided Context Broker Url. In case of already existing entity, it tries to update it, by sending a POST to ``/v2/entities/{existingId}/attrs`` endpoint.

Orion configurations can be specified either in the config.js file or as command line arguments.

###### Orion configuration in configuration file

Following options are to be properly modified in ``config.orionWriter`` object contained ``config.js`` file:

- ``orionUrl``: The Base Url (without /v2...), of Orion Context Broker.

Followings enable to send entities to a secured Context Broker :

- ``orionAuthHeaderName`` **(under development)**: The name of Authentication Header (e.g. **"Authorization"**).
- ``orionAuthToken``: **(under development)**: The value of Authentication Header (e.g **Bearer XXXX** ).

###### Orion configuration as command line arguments

In order to use Orion Writer configuration as command line arguments, when launching the tool with ``node mapper`` command, append following argument:

- ``-u, --orionUrl``: The Base Url (without /v2…), of Orion Context Broker.

--------------------

## 4. Mapping Guide

This section describes, with examples, how to compile the JSON Map file, whose path must be specified as input configuration, as described in [Inputs Configuration](#inputs-configuration) section.

### 4.1 Source Input File

**IMPORTANT**
The source file must be CSV, Json or GeoJson and **MUST BE** in **UTF8** encoding. If the source file has another encoding (e.g. ANSI), please first convert it to UTF8 encoding (e.g. by using conversion with NotePad++).

- **CSV**
    If the source file is a CSV, the tool extracts columns from the first row, for each line following the first, parses the CSV row and creates an intermediate data object (JSON), where each key-value field will have the CSV column as key and the specific CSV row value as value.
    So every CSV row (starting fro second one) will represent an intermediate object that will be mapped in an NGSI entity.

- **JSON**
        In this case the input file should be already in the "intermediate" form, that is a JSON Array, where each object contains key-value fields to be mapped directly to a NGSI entity.
- **GeoJSON**
    The GEOJSON file must be a **Feature Collection**. So, the file must be in the form:
     ```
      {
       "type": "FeatureCollection",
       "features": [
          {
             "type": "Feature",
             "geometry": {...},
             "properties": {...}
          },
          ........
       ]}
    ```

### 4.2 Mapping

The tool needs the Mapping JSON, in order to know how to map each source field of the parsed row/object in the destination fields. The map MUST be a **well formed JSON**.
It will consist of a collection of **key-value pairs**, where:

- **KEY** is the **DESTINATION** field, belonging to a target Data Model (e.g. address or totalSlotNumber for BikeHireDockingStation).
  - If the **KEY** has the reserved name ***"entitySourceId"**, its corresponding
  **VALUE** will represent the source field from which the **EntityName** part of ID
  will be taken, according to SynchroniCity Entity ID Recommendation (See [Id Pattern Configuration](id-pattern-configuration) section).

- **VALUE** is the **SOURCE** field, belonging to the source data (that is the parsed row/ object).

So the **SOURCE** value will be mapped to the **DESTINATION** field.

The **VALUE**, corresponding to the **KEY** in the mapping pair is the **SOURCE** field, which can be a string, a string array or an object (see Examples):
1) **String**:  the source field is a single value;

   - The source field name can be also a "**nested field**", and can be specified
    through dot notation (specifically used in case of **JSON/GeoJson** inputs) .
   - If the String starts with **static:** (e.g. **"static: something"**), following substring ("**something**"), will represent **ACTUALLY the value** of the resulting mapped field, instead of the source field name where to take the actual value. This is a way for specifying custom values that are not present as field values in the source object.

2) **String Array**: each string contained in the array represents a source field and will be
                     concatenated (with **-** separator) and mapped to the corresponding
                     **DESTINATION** field (represented  by the key in the mapping pair).
3) **Object**:  more source fields will be mapped to a structured destination field.

 **Note.** Following examples omit mandatory fields for mapped NGSI entities, such as **"id"** and **"type"**. These are automatically included by the tool.

------------------------------------

#### 4.2.1 Use Case Examples

##### CSV Example

We have an input **CSV** file, representing Bike Sharing stations.
We want to map each CSV row to an entity of the target Data Model **BikeHireDockingStation**.

The first row contains the columns definitions:

```
LOCALITÀ DI INTERVENTO;"Attrattore Tipo";"Attrattore Nome";Municipio;"Posti × manuf";"Tot manuf";"Tot posti";Data di posa;;;;;;;;
 ```

The second line, the first one representing a mappable source object is:

```
Alemagna, Viale – Presso Triennale di Milano;Museo;Triennale di Milano;1;5;8;40;2015-06-27;;;;;;;;;;
```

The resulting **JSON map**, according to the target Data Model, will be:

```
{
   "address": {
      "streetAddress": "LOCALITÀ DI INTERVENTO"
   },
   "areaServed": "Attrattore Tipo",
   "totalSlotNumber": "Tot posti"
}
```

Note that the "address" destination field, is a structured object, containing the **DESTINATION** streeAddress, which is mapped to the **SOURCE** field **"LOCALITÀ DI INTERVENTO"**.
So the corresponding value (in this case "Agnello, Via – cv 20") will be mapped as the value of the field "streetAddress".
The resulting object will be:

```
{
   "address": {
      "streetAddress": "Alemagna, Viale – Presso Triennale di Milano"
   },
   "areaServed": "Museo",
   "totalSlotNumber": 40
}
```

In this case, it would be better indeed to concatenate both **"Attrattore Tipo"** and **"Attrattore Nome"** source fields to the destination **"areaServed"** field.
Then the **JSON map** will be:

```
{
   "address": {
      "streetAddress": "LOCALITÀ DI INTERVENTO"
   },
   "areaServed": [
      "Attrattore Tipo",
      "Attrattore Nome"
   ],
   "totalSlotNumber": "Tot posti"
}
 ```

The resulting object will be:

 ```
{
   "address": {
      "streetAddress": "Alemagna, Viale – Presso Triennale di Milano"
   },
   "areaServed": "Museo - Triennale di Milano",
   "totalSlotNumber": 40
}
 ```

Finally, as previously described, if we want to specify DIRECTLY a static custom value for a resulting mapped object, the string Value of a mapping pair will have the **"static:" prefix**.
The map will be:

```
{
   "address": {
      "streetAddress": "LOCALITÀ DI INTERVENTO"
   },
   "areaServed": [
      "Attrattore Tipo",
      "Attrattore Nome"
   ],
   "totalSlotNumber": "Tot posti",
   "name": [
      "static:Rastrelliere - ",
      "LOCALITÀ DI INTERVENTO"
   ]
}
```

In this case we are concatenating, for target "**name**" field, two values:
1) "Rastrelliere - " literally
2) The value contained in the source field **"LOCALITÀ DI INTERVENTO"**

---------------------

##### GeoJson Example

We have an input **GeoJson** file, containing a Feature Collection and representing Bike Sharing stations.
We want to map each Feature as an entity of the target Data Model **BikeHireDockingStation**

For instance, for the feature:

```
{
   "type": "Feature",
   "geometry": {
      "type": "Point",
      "coordinates": [
         9.189043,
         45.464725
      ]
   },
   "properties": {
      "ID": 1,
      "BIKE_SH": "001 Duomo 1",
      "INDIRIZZO": "P.za Duomo",
      "ANNO": 2008,
      "STALLI": 24,
      "LOCALIZ": "Carreggiata"
   }
}
```

The resulting **JSON Map**, according to  target Data Model, will be:

```
{
   "name": "properties.BIKE_SH",
   "location": "geometry",
   "totalSlotNumber": "properties.STALLI",
   "entitySourceId": "properties.BIKE_SH",
   "address": {
      "streetAddress": "properties.INDIRIZZO"
   }
}
```

In this case, **nested source fields** can be accessed through the dot notation.

The final resulting object will be:

```
{
   "id": "urn:ngsi-ld:entity-Type:site:service:group:entityName",
   "name": "001 Duomo 1",
   "location": {
      "type": "Point",
      "coordinates": [
         9.189043,
         45.464725
      ]
   },
   "address": {
      "streetAddress": "P.za Duomo"
   },
   "totalSlotNumber": 24
}
```

The ID will be composed by:

- **urn:ngsi-ld**, statically added.
- **entity-type**, target Data Model, as specified in **Inputs Configuration** step .
- **site**, **service**, **group**, whose values was defined in **ID Pattern Configuration** step.
- **entityName**: as specified either in the **entitySourceId** field of JSON Map or automatically generated.

---------------

## 5. Logging

The tool will collect several types of logging messages.

- **Application Log**: in ```/logs``` folder, .out and .error daily files. Logs messages, according to the Log Level set in the [Application Configuration](application-configuration) part.
- **Validation Report**: in ```/reports/validation``` folder, file with messages about mapped objects that passed or not the validation against target Data Model Schema.
- **Orion Report**: in ```/reposts/orion/``` folder, file with messages about validated mapped objects that was written/not written in the Orion Context Broker, whose url was defined in the [Orion Writer Configuration](orion-writer-configuration) part.

----------------

## 6. License

The Data Model Mapper tool is licensed under Affero General Public License (GPL) version 3.

Copyright (C) 2018 Engineering Ingegneria Informatica S.p.A.