import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

import { UserLoginService } from "../shared/cognito.service";

@Injectable()
export class Authenticated implements CanActivate {

    constructor(
        private auth: UserLoginService,
        private router: Router) { }

    canActivate() {

        let response = false;

        this.auth.isAuthenticated({
            isLoggedIn: (message: string, isLoggedIn: boolean) => {
                response = isLoggedIn;
            }
        });

        return response;
    }
}
