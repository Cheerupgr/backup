import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { Router } from "@angular/router";

@Component({
    selector: 'left-sidebar',
    templateUrl: 'left-sidebar.html'
})
export class LeftSidebar {

    constructor(public menu: MenuController,public router: Router) {
        menu.enable(true);
    }

    gotoPatientList(){
      this.router.navigate(['./app/directory']);
    }

    goto(){

    }

    gotoMessage(){

      this.router.navigate(['./app/message']);
    }
    gotoDashboard(){
      this.router.navigate(['./app/dashboard']);
    }
}
