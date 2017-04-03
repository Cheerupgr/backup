import { Component } from '@angular/core';
import { PopoverController } from 'ionic-angular';
import { AuthGuard } from '../auth-guard.service';
import { Router } from "@angular/router";
import {DropdownMenuPopover} from "./dropdown-menu/dropdown-menu";

@Component({
    selector: 'page-header',
    templateUrl: 'header.html'
})

export class Header {
  public clickedUserFlag:boolean = false;

  constructor(public auth: AuthGuard,public router: Router, public popoverCtrl: PopoverController) {

  }

  logout(){
    this.auth.logOut();
  }

  profile() {
    this.router.navigate(['./app/profile']);
  }

  setting(myEvent) {
    let popover = this.popoverCtrl.create(DropdownMenuPopover, {
    }, {
      cssClass: 'dropdown-menu'
    });

    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(value => {
      switch(value) {
        case 'signout':
          this.logout();
          break;
        default:
          break;
      }
    });
  }

  addUser(){
    this.clickedUserFlag = true;
  }

  editPatient(){
    this.clickedUserFlag = false;
    this.router.navigate(['./app/new-patient']);
  }
  editCaregiver(){
    this.clickedUserFlag = false;
    this.router.navigate(['./app/new-caregiver']);
  }
}
