import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'dropdown-menu',
    templateUrl: 'dropdown-menu.html'
})
export class DropdownMenuPopover {

  constructor(public viewCtrl: ViewController, public params: NavParams) {
  }

  signout(){
    this.viewCtrl.dismiss('signout');
  }
}
