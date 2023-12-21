import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthOAuth2JWTToken, NbAuthResult, NbAuthService, NbTokenService } from '@nebular/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { NB_WINDOW } from '@nebular/theme';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig } from '../../model/appConfig';


@Component({
  selector: 'ngx-nb-oauth2-logout',
  template: ``
})
export class AuthLogoutComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  config: AppConfig;

  constructor(private authService: NbAuthService,
    private tokenService: NbTokenService,
    private router: Router,
    private configService: NgxConfigureService,
    private http: HttpClient,
    @Inject(NB_WINDOW) private window) {
      this.config = this.configService.config as AppConfig;

  }


  async ngOnInit(): Promise<void> {

    try {
      let token = await this.authService.getToken().toPromise() as NbAuthOAuth2JWTToken;

      this.authService.logout(this.config.system.auth.authProfile)
        .pipe(takeUntil(this.destroy$))
        .subscribe((authResult: NbAuthResult) => {
          if (authResult.isSuccess()) {

            this.window.location.href =
              `${this.config.system.auth.idmHost}/logout?id_token_hint=${token.getPayload().id_token}&post_logout_redirect_uri=${this.config.system.dmmGuiUrl}/login`;

          } else {
            this.router.navigateByUrl('');
          }
        }, (error) => {
          console.log(error)
        });

    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
