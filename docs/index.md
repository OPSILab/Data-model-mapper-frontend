# Installing Data model mapper GUI 


This section covers the steps needed to properly install the Data model mapper GUI. 
It is an [Angular](https://angular.io/) Web portal based on [Nebular/Ngx-admin](https://github.com/akveo/nebular) framework that can be installed in the following ways:

-   Build as Angular distribution and deploy natively on a Web Server
-   Run as Docker containerized environment


The following sections describe each installation method in detail.

---
## Install natively on Web Server

Build Angular application and deploy compiled folder on a Web Server.

### Requirements

In order to install Data model mapper GUI the followings must be correctly installed and
configured:

| Framework                                                                                                      | Version                | Licence                                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------- |---------------------------------------- |
| [NodeJS with NPM](https://nodejs.org/en/)                                                                      | >=14.15                | MIT                                     |
| [Apache](https://httpd.apache.org) or [Nginx](https://nginx.org/en) Web server                                 | 2.4.43 / 1.18.0        | Apache License v.2.0 /  2-clause BSD    |

&nbsp;
### Build Angular Application

Execute the following commands to create the dist folder.

-  Move into `frontend/` folder:

```bash
cd frontend
```

- Run following commands:

```bash
npm install
```

```bash
npm run build:prod
```

- The application files will be compiled into `dist` folder



### Deployment and Configuration

#### Dist folder deployment

Move the files in `dist` subfolder to a new folder on the Web server document root (e.g. `/var/www/html` for Apache and `/usr/share/nginx/html` for Nginx.

#### Configuration

Once the dist folder files are deployed and the server has started, modify the
fields of `config.json` configuration file, located in `dist/assets/` folder.
(These modifications can be made also in `frontend/src/assets/config.json` file before building the Application, as described in the section above).

- **`system.sdkUrl`**: with **PUBLIC** (as the Dashboard will make HTTP calls from frontend running locally on browser) endpoint (**`host`:`port`/api/v2**) where (if any) Cape SDK Client is listening (see [CaPe](https://github.com/OPSILab/Cape))

```  
  "system": {
    "sdkUrl": "http://localhost:8085/cape-service-sdk/api/v2",
``` 

- **`system.dmmGuiUrl`**: with endpoint (**`host`:`port`**) where the dashboard is running (depends on Web server configuration or if running with Docker on different published port).

```   
    "dmmGuiUrl": "http://localhost:12345/data-model-mapper-gui",
```   

- **`system.detailedErrors`**: the supported value are `true` or `false`. If `true`, it enables detailed error on error dialog.

```   
    "detailedErrors": true,
```  

- **`data_model_mapper.default_mapper_url`**: The default url called in order to obtain mapper list.

```   
    "default_mapper_url": "http://localhost:5500/api/mapper",
```  

- **`i18n.locale`**: with locale ( `en` allowed as default) enabling internazionalization on Dashboard pages. 

```
  },
  "i18n": {
    "locale": "en",
    "languages": ["it","en"] 
  }
}
```

#### Enabling other languages

In the Service Catalogue translations are available directly for the following parts:
- Page Labels

##### Page Labels
Page Labels are available in 
`frontend/src/assets/data/i18n/`**LOCALE**`.json`

Where **`LOCALE`** is one of the configured languages in

frontend/src/assets/config.json file :
```
"i18n": { 
       "locale": "en", 
         "languages": ["it","en"] 
        }
```

Copy, paste and rename “en.json” file with the selected language (e.g. “el”) and translate each property value. Ex:

```
"welcome": "Welcome to Data model mapper GUI!"
```
To
```
"welcome": "Καλωσορίσατε στο γραφικό περιβάλλον χρήσης χαρτογράφησης μοντέλου δεδομένων!"
```

by respecting upper/low cases, Ex:

```
"error": "Error"
```
to
```
"error": "λάθος",
```

## Install with Docker-compose

Data model mapper can be run as Docker container (based on Nginx image), by using the provided `docker-compose.yml` file.

### Prerequisites

You must install of course:

   -  **Docker Engine**: version >= 20.10 ([see the guide](https://docs.docker.com/get-docker/)).
   -  **Docker Compose**: ([see the guide](https://docs.docker.com/compose/install/#install-compose)).


### Configuration

The provided `docker-compose.yml` file has also directives to mount the provided `nginx.conf` file, needed to correctly handle deep-linking on deployed Dashboard Angular application.

It contains also the mount to the `src/assets/config.json` file, which allows to configure the Dashboard as described in the [Deployment and Configuration](#deployment-and-configuration) section.

**SOON.** Will be available configuration with environment variables to be set directly in `environment` section of `docker-compose.yml` file.

### Start it up with Docker Compose

- Firstly, move into **`frontend`** folder and build an image :

```bash
docker build . -t data-model-mapper-gui
```
  
- Ensure you modified `config.json` file properly, as described in the section above.
	
-  Run the docker-compose file with:

```bash
docker-compose up
```

The containers will be automatically started and attached to the created network.

---
## Launch and Learn

The Data model mapper GUI is available to the endpoint according to installation mode (Web server or Docker).

Open your favourite browser and point to that endpoint.

Go to [Data model mapper usage manual](../usage.md) section to learn how to use the Data model mapper GUI.

---

