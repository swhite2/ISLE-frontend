import { Component, OnInit } from '@angular/core';
import { LeapDataService } from './services/leap-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ISLE-frontend';
  hasData: boolean = false;

  constructor(public leapDataService: LeapDataService) {}

  ngOnInit() {
    // this.getMessages();
  }

  getMessages(): void {
    this.leapDataService.getData()
      .subscribe(data => {
        this.leapDataService.add(data);
        this.hasData = true;
      });
  }

}
