import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'edit-schedule',
    templateUrl: 'edit-schedule.html'
})
export class EditSchedulePopover {

  constructor(public viewCtrl: ViewController, public params: NavParams) {
  }

  close () {
    this.viewCtrl.dismiss();
  }

  cancel () {
    this.close();
  }

  apply () {
    this.close();
  }
}
