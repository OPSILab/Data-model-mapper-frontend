import { Component } from '@angular/core';
import { NgxConfigureService } from 'ngx-configure';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig, System } from '../../model/appConfig';

@Component({
  selector: 'login',
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private environment: System;

  constructor(private configService: NgxConfigureService, private route: ActivatedRoute, private router: Router,
  ) {
    this.environment = (this.configService.config as AppConfig).system;
  }

  public login = (): void => {
    // Propagates (if any) queryParams, in order to be propagated also in the redirected URL after authentication
    const queryParams = this.route.snapshot.queryParams;
    let queryString = '';
    if (queryParams && Object.keys(queryParams).length > 0)
      queryString = Object.entries<string>(queryParams).reduce((acc, entry) => {
        return `${acc}&${entry[0]}=${entry[1]}`;
      }, '');

    console.debug(queryString)
    console.debug(queryParams)

    let popupRoute = '..//loginPopup'+'?'+queryString
    this.router.navigate(['../loginPopup', { relativeTo: this.route}])//, queryParams: { parametro1: 'valore1', parametro2: 'valore2' } }]);
    //this.router.navigate['loginPopup']
    /*
        this.popupCenter({
          //url:"http://localhost:8080/realms/myrealm/protocol/openid-connect/auth?client_id=client&redirect_uri=http%3A%2F%2Flocalhost%3A12345&state=6a06fb97-faf5-459b-b5d1-dcd190631725&response_mode=fragment&response_type=code&scope=openid&nonce=b91b0bba-dff8-4f13-8943-3737af127893&code_challenge=jzCIFkAPJOPB5abo8up7snknW2CqKfmX-z_7JOEWlQg&code_challenge_method=S256",//
          //url: "http://localhost:8080/realms/myrealm/protocol/openid-connect/auth?response_type=code&client_id=client&redirect_uri=http://localhost:12345&scope=openid&state=30a2315f-56ba-43b1-b625-eab0d0b49cc0",

          //url:this.environment.auth.idmHost + "/realms/"+this.environment.auth.authRealm+"/protocol/openid-connect/auth?response_type=code&client_id="+this.environment.auth.clientId+"&redirect_uri=http://localhost:12345/data-model-mapper-gui/login/loginPopup&scope=openid&state=b9fabbc4-1b5a-4c22-a5bc-f6c655bbf174",

          url:`${this.environment.dmmGuiUrl}/login/loginPopup?${queryString}`,
          title: 'AuthPopup',
          w: 780,
          h: 650,
        });*/
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  popupCenter = ({ url, title, w, h }) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    const newWindow = window.open(
      url,
      title,
      `
      toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no,
      width=${w / systemZoom},
      height=${h / systemZoom},
      top=${top + 50},
      left=${left}
      `
    );

    if (window.focus) newWindow.focus();
  };
}
