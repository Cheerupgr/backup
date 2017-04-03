import { Component } from '@angular/core';
import { PopoverController } from 'ionic-angular';
import { AuthGuard } from '../../auth-guard.service';
import {EditPatientPopover} from './edit-patients/edit-patients';
import {ListSchedulePopover} from './list-schedule/list-schedule';
import {EditSchedulePopover} from './edit-schedule/edit-schedule';
import {EditTaskPopover} from './edit-task/edit-task';

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})
export class ProfilePage {
    public patients:any = [];
    public schedules:any = [];
    public tasks:any = [];
    public comments:any = [];
    public expanded = [false, false, false, false];
    public scheduleDetailShowed = false;

    constructor(private auth: AuthGuard, public popoverCtrl: PopoverController) {
      this.getPatients();
      this.getSchedules();
      this.getTasks();
      this.getComments();
    }

    getPatients(){
      this.patients = [{name:"Ross Netherway"}, {name:"Alice Cabb"}, {name:"Oscar Bonito"}, {name:"Michael Bloom"}];
    }

    getSchedules() {
      this.schedules = [{time:"9 AM"},{time:"10 AM"},{time:"11 AM"},{time:"12 PM"},{time:"1 PM"},{time:"2 PM"},{time:"3 PM"}];
    }

    getTasks() {
      this.tasks = [{name:"Ross Netherway"}, {name:"Alice Cabb"}, {name:"Oscar Bonito"}, {name:"Michael Bloom"}];
    }

    getComments() {
      this.comments = [{name: "Adam Baum", category: "Medication", comment: "Meds might causing side effects...", date: "Yesterday", time: "8:30 AM"},
          {name: "Adam Baum", category: "Meals", comment: "Make sure all meals are gluten...", date: "Today", time: "8:30 AM"},
          {name: "Adam Baum", category: "Exercise", comment: "He seems to have more energy...", date: "Wed", time: "4:45 PM"},
          {name: "Adam Baum", category: "Appointment", comment: "He has two appts today...", date: "Mon", time: "6:30 PM"}
        ];
    }

    getCommentIcon(category) {
      var iconUrl = '';
      switch(category){
        case 'Medication':
          iconUrl = 'url(assets/icon/pillicon.png)';
          break;
        case 'Meals':
          iconUrl = 'url(assets/icon/foodicon.png)';
          break;
        case 'Exercise':
          iconUrl = 'url(assets/icon/walkicon.png)';
          break;
        case 'Appointment':
          iconUrl = 'url(assets/icon/appts.png)';
          break;
        default:
          break;
      }
      return iconUrl;
    }

    toggleExpanded(i) {
      this.expanded[i] =! this.expanded[i];
    }

    showScheduleDetail(i) {
      this.scheduleDetailShowed =! this.scheduleDetailShowed;
    }

    hideScheduleDetail(i) {
      this.scheduleDetailShowed = false;
    }

    updatePatients(newPatients) {
      this.patients = newPatients;
    }

    editPatients(myevent) {
      let popover = this.popoverCtrl.create(EditPatientPopover, {
        patients: this.patients
      }, {
        cssClass: 'edit-patients'
      });

      popover.onDidDismiss(value => {
        if (value != null) {
          this.updatePatients(value);
        }
      });

      popover.present();
    }

    editSchedule() {
      let popover = this.popoverCtrl.create(EditSchedulePopover, {
      }, {
        cssClass: 'edit-schedule'
      });

      popover.present();
    }

    listSchedule() {
      let popover = this.popoverCtrl.create(ListSchedulePopover, {
      }, {
        // enableBackdropDismiss: false,
        cssClass: 'list-schedule'
      });

      popover.present();
    }

    addTask() {
      let popover = this.popoverCtrl.create(EditTaskPopover, {
      }, {
        cssClass: 'edit-task'
      });

      popover.present();
    }

    editTask() {
      let popover = this.popoverCtrl.create(EditTaskPopover, {
      }, {
        cssClass: 'edit-task'
      });

      popover.present();
    }
}
