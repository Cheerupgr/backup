import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import {NavParams} from 'ionic-angular';

@Component({
    selector: 'edit-patients',
    templateUrl: 'edit-patients.html'
})
export class EditPatientPopover {

  public patients:any = [];
  public newPatient = "";

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.getPatients();
  }

  getPatients(){
    this.patients = this.params.get('patients').slice();
  }

  removePatient(i) {
    this.patients.splice(i, 1);
  }

  close() {
    this.viewCtrl.dismiss(this.patients);
  }

  done() {
    if (this.newPatient != "") {
      this.patients.push ({name:this.newPatient});
    }
    this.close();
  }
}
