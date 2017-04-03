import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'edit-task',
    templateUrl: 'edit-task.html'
})
export class EditTaskPopover {

  constructor(public viewCtrl: ViewController, public params: NavParams) {
  }

  close() {
    this.viewCtrl.dismiss();
  }

  done() {
    this.close();
  }
}
