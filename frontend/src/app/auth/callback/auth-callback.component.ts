import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NbAuthService, NbAuthResult } from '@nebular/auth';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { EvitaAPIService } from '../../pages/services/evita-api.service';

@Component({
  selector: 'nb-playground-oauth2-callback',
  template: ``,
})
export class AuthCallbackComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService, private router: Router, private configService: ConfigService,
    private evitaAPIService: EvitaAPIService) {
    this.authService.authenticate(this.configService.getSettings("keycloak.authProfile"))
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        if (authResult.isSuccess()) {
          this.evitaAPIService.getUser().subscribe(evitaUser => {
            console.log('Succes, Evita User:', evitaUser);
            //inserisco il filtro per il tablet
            const isTabletDevice = /iPad|Android/i.test(navigator.userAgent);
            //const isTabletDevice = /Chrome/.test(window.navigator.userAgent);
            console.log('Non so se sto utilizzando Chrome  :', window.navigator.userAgent);

            if (isTabletDevice) {
              this.router.navigateByUrl('/pages/dialogue-manager');
              console.log('Sto utilizzando Chrome!  :');
            } else {
              this.router.navigateByUrl('/pages/homepage')
            }
          }, err => {
            console.log(err);
            this.router.navigateByUrl('/user')
          })
        } else {
          this.router.navigateByUrl('');
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