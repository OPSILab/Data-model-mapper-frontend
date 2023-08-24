import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  public static Enum = {
    COMPLETED : "Completed",
    UNDER_DEVELOMPENT : "Under development"
  }

  constructor() { }

  ngOnInit(): void {
  }

}
