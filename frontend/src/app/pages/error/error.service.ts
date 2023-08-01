import { Injectable } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ErrorComponent } from './error.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private modalService: NbDialogService) {}

  openErrorDialog(error: unknown): void {
    this.modalService.open(ErrorComponent, {
      context: {
        error: error,
      },
      hasScroll: false,
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
}
