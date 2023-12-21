import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { NbAuthOAuth2JWTToken, NbAuthOAuth2Token, NbAuthService } from '@nebular/auth';
import { ConfigService } from '@ngx-config/core';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  token;
  constructor(public auth: NbAuthService,
    //public config:ConfigService
    ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.indexOf('/assets/') > -1) {
      return next.handle(req);

    }
    // || req.url.includes(this.config.getSettings('huawei.baseURLAccessToken'))
    if (req.url.indexOf('/oauth2/authorize') > -1
    || req.url.indexOf('/oauth2/token') > -1
    || req.url.indexOf('/auth/local') > -1
    || req.url.indexOf('/openid-connect/token') > -1
    || req.url.indexOf('oauth2/v3/token') > -1
    || req.url.indexOf('oauth2/v3/authorize') > -1
    || req.url.indexOf('/api/gethomecoachsdata') > -1
    || req.url.indexOf('/api/devices/send_data') > -1
    || req.url.indexOf('/api/clients/getGamesUserInfoEUvsJP') > -1
    //|| req.url.includes(this.config.getSettings('strapi.baseURL'))
    || req.url.includes("https://raw.githubusercontent.com/e-VITA/e-VITA-Dashboard-Translations") ) {
      return next.handle(req);
    }

    let newHeaders = req.headers;

    //if(this.config.getSettings('enableAuthentication')){
      this.auth.getToken().subscribe((x: NbAuthOAuth2JWTToken) => this.token = x);
      if (this.token.getPayload() != null) {
        newHeaders = newHeaders.append('Authorization', 'Bearer ' + this.token.getPayload().access_token);
        localStorage.setItem("access_token", this.token.getPayload().access_token);
      }
    //}

    const authReq = req.clone({ headers: newHeaders });
    return next.handle(authReq);
  }
}
