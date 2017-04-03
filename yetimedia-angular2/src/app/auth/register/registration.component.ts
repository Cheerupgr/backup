import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ToastController } from 'ionic-angular';

import { UserRegistrationService, CognitoCallback } from "../../shared/cognito.service";

export class RegistrationUser {
    name: string;
    email: string;
    password: string;
    group: string;
}
/**
 * This component is responsible for displaying and controlling
 * the registration of the user.
 */
@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './registration.html'
})
export class RegisterComponent implements CognitoCallback {
    registrationUser: RegistrationUser;
    roles: Array<string>;
    router: Router;

    constructor(
        private toastCtrl: ToastController,
        public userRegistration: UserRegistrationService,
        router: Router) {
        this.router = router;
        this.onInit();
    }

    onInit() {
        this.registrationUser = new RegistrationUser();
        // this.roles = [
        //     'admin',
        //     'caregiver',
        //     'doctor',
        //     'family_members',
        //     'nurse'
        // ];
    }

    onRegister() {
        this.userRegistration.register(this.registrationUser, this);
    }

    cognitoCallback(message: string, result: any) {
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
            //move to the next step
            console.log("redirecting");
            this.router.navigate(['/session/confirmRegistration', result.user.username]);
        }
    }
}
