import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from 'ionic-angular';

import { CognitoCallback, UserRegistrationService } from '../../shared/cognito.service';


@Component({
    selector: 'login-page',
    templateUrl: './resendCode.html'
})

export class ResendCodeComponent implements CognitoCallback {

    email: string;

    constructor(public registrationService: UserRegistrationService,
        public router: Router,
        private toastCtrl: ToastController, ) {
    }

    resendCode() {
        if (this.email === null) {
            let toast = this.toastCtrl.create({
                message: 'Please enter an email address',
                duration: 3000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                console.log('Dismissed toast');
            });

            toast.present();
            return;
        }

        this.registrationService.resendCode(this.email, this);
    }

    cognitoCallback(error: any, result: any) {

        if (error != null) {

            let toast = this.toastCtrl.create({
                message: error,
                duration: 3000,
                position: 'top'
            });
            toast.present();
        } else {
            this.router.navigate(['/session/confirmRegistration', this.email]);
        }
    }
}
