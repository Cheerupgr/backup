import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastController } from 'ionic-angular';

import { CognitoCallback, UserLoginService } from "../../shared/cognito.service";

@Component({
    selector: 'login-page',
    templateUrl: './forgotPassword.html',
    styleUrls: []
})
export class ForgotPasswordStep1Component implements CognitoCallback {
    email: string;

    constructor(public router: Router,
        private toastCtrl: ToastController,
        public userService: UserLoginService) {
    }

    onNext() {
        this.userService.forgotPassword(this.email, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message == null && result == null) {
            this.router.navigate(['/auth/forgotPassword', this.email]);
        } else { //success

            let toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                console.log('Dismissed toast');
            });

            toast.present();
        }
    }
}


@Component({
    selector: 'login-page',
    templateUrl: './forgotPasswordStep2.html'
})
export class ForgotPassword2Component implements CognitoCallback, OnInit, OnDestroy {

    verificationCode: string;
    email: string;
    password: string;
    private sub: any;

    constructor(public router: Router, public route: ActivatedRoute,
        private toastCtrl: ToastController,
        public userService: UserLoginService) {
        console.log("email from the url: " + this.email);
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.email = params['email'];

        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    onNext() {
        this.userService.confirmNewPassword(this.email, this.verificationCode, this.password, this);
    }

    cognitoCallback(message: string) {
        if (message != null) { //error
            let toast = this.toastCtrl.create({
                message: message,
                duration: 6000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                console.log('Dismissed toast');
            });

            toast.present();
        } else { //success
            this.router.navigate(['/auth/login']);
        }
    }

}
