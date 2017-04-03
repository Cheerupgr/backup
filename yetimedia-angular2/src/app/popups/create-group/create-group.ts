import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'create-group',
    templateUrl: 'create-group.html'
})
export class CreteGroupPopover {
  public initialGroups: any = [];
  public groupsToRemove: any = [];
  public newGroup = "";
  public groupToAdd: {};
  public newPatient = "";
  public patientToAdd: {};

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.getGroups();
  }

  getGroups () {
    this.initialGroups = this.params.get('groups').slice();
  }

  removeGroup (i) {
    this.groupsToRemove.push(this.initialGroups[i]);
  }

  close () {
    this.viewCtrl.dismiss({
      groupToAdd: this.groupToAdd,
      patientToAdd: this.patientToAdd,
      groupsToRemove: this.groupsToRemove
    });
  }

  done () {
    // add newGroup
    if (this.newGroup != "") {
      this.groupToAdd = {name: this.newGroup};
    }

    if (this.newPatient != "") {
      this.patientToAdd = {name: this.newPatient};
    }

    // remove the groups checked as to remove

    this.initialGroups.forEach((item, index) => {
      if (item.checked) {
        this.removeGroup(index);
      }
    });
    
    this.close();
  }
}
