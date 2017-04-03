import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

import { UserLoginService, LoggedInCallback } from "../shared/cognito.service";

@Injectable()
export class Unauthenticated implements CanActivate, LoggedInCallback {

    constructor(
        private auth: UserLoginService,
        private router: Router) { }

    canActivate() {
        console.log('response', this.auth.isAuthenticated(this));

        return new Promise((resolve, reject) => {
            this.auth.isAuthenticated({
                isLoggedIn: (message: string, isLoggedIn: boolean) => {

                    if (isLoggedIn) {
                        this.router.navigate(['']);
                    }

                    isLoggedIn ? reject(false) : resolve(true);
                }
            });
        })
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        return true;
    }
}
