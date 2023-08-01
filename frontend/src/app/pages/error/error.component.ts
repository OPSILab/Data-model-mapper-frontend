import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  public error;

  constructor(public ref: NbDialogRef<unknown>){}//, private _location: Location,){} //private loginService: LoginService) {}
  ngOnInit(): void {
   // throw new Error('Method not implemented.');
  }

  closeModal(error: { [key: string]: { cause?: string } }): void {
    //if (error.error?.cause === 'it.eng.opsi.cape.exception.AuditLogNotFoundException' || (error.status as any) === 401)
      //void this.loginService.logout().catch((error) => console.log(error));
    // else
    //   this.backClicked();
    this.ref.close();
  }

  backClicked(): void {
    //this._location.back();
  }

}
