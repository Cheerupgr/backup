import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastController } from 'ionic-angular';

import { UserRegistrationService, UserLoginService, LoggedInCallback } from "../../shared/cognito.service";

@Component({
    selector: 'awscognito-angular2-app',
    template: ''
})

export class LogoutComponent implements LoggedInCallback {

    constructor(public router: Router,
        public userService: UserLoginService) {
        this.userService.isAuthenticated(this)
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (isLoggedIn) {
            this.userService.logout();
            this.router.navigate(['/home']);
        }

        this.router.navigate(['/home']);
    }
}

@Component({
    selector: 'login-page',
    templateUrl: './confirmRegistration.html'
})

export class RegistrationConfirmationComponent implements OnInit, OnDestroy {
    confirmationCode: string;
    email: string;
    private sub: any;

    constructor(public regService: UserRegistrationService,
        public router: Router,
        public route: ActivatedRoute,
        private toastCtrl: ToastController) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.email = params['username'];

        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    onConfirmRegistration() {
        this.regService.confirmRegistration(this.email, this.confirmationCode, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) { //error

            let toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                console.log('Dismissed toast');
            });

            toast.present();

        } else { //success
            //move to the next step
            console.log("Moving to securehome");
            // this.configs.curUser = result.user;
            this.router.navigate(['']);
        }
    }
}
