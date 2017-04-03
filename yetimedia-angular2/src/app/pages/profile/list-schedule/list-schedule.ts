import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'list-schedule',
    templateUrl: 'list-schedule.html'
})
export class ListSchedulePopover {

  constructor(public viewCtrl: ViewController, public params: NavParams) {
  }

  close () {
    this.viewCtrl.dismiss();
  }

  exportSchedule () {
    this.close();
  }
}
