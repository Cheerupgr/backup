import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { LoggedInCallback, UserLoginService } from "../shared/cognito.service";

@Component({
    template: ''
})
export class AuthComponent implements OnInit, LoggedInCallback {

    constructor(
        public router: Router,
        public userService: UserLoginService) {
    }

    ngOnInit() {
        this.userService.isAuthenticated(this);
        console.log("SecureHomeComponent: constructor");
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {

        // if (isLoggedIn) {
        //     this.router.navigate(['/app/home']);
        // } else {
        //     this.router.navigate(['/session/login']);
        // }
    }
}
