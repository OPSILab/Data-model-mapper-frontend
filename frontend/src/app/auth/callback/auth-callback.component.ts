import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NbAuthService, NbAuthResult } from '@nebular/auth';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig } from '../../model/appConfig';

@Component({
  selector: 'nb-playground-oauth2-callback',
  template: ``,
})
export class AuthCallbackComponent implements OnDestroy {

  private destroy$ = new Subject<void>();
  config: AppConfig;

  constructor(private authService: NbAuthService, private router: Router, private configService: NgxConfigureService

  ) {
    this.config = this.configService.config as AppConfig;

    this.authService.authenticate(this.config.system.auth.authProfile)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        if (authResult.isSuccess()) {
          this.router.navigateByUrl('/pages/home')
        } else {
          console.debug(authResult)
          //this.router.navigateByUrl('/login/loginPopup');
        }
      }, (error) => {
        console.log(error)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
