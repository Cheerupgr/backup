import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ToastController } from 'ionic-angular';

import { CognitoCallback, UserLoginService, CognitoUtil } from "../../shared/cognito.service";
import { AwsUtil } from "../../shared/aws.service";
import * as sjcl from 'sjcl';

@Component({
    selector: 'login-page',
    templateUrl: './login.html',
    styleUrls: ['/app/auth/login/login.scss']
})
export class LoginComponent implements CognitoCallback {
    email: string;
    password: string;

    constructor(
        public awsUtil: AwsUtil,
        public cognito: CognitoUtil,
        public router: Router,
        public userService: UserLoginService,
        private toastCtrl: ToastController) {
    }

    onLogin() {
        this.userService.authenticate(this.email, this.password, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) { //error

            let toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'top'
            });

            toast.present();

            if (message === 'User is not confirmed.') {
                this.router.navigate(['/auth/confirmRegistration', this.email]);
            }
        } else { //success

            let mythis = this, loggedIn = false;

            this.cognito.getIdToken({
                callback() {
                },
                callbackWithParam(token: any) {

                    if (token) {

                        let payloadToken = token.split('.')[1];

                        let payload = JSON.parse(
                            sjcl.default.codec.utf8String.fromBits(
                                sjcl.default.codec.base64url.toBits(payloadToken)
                            )
                        );

                        let validRoles = CognitoUtil._VALID_ROLES.filter(function (group) {
                            if (payload["cognito:groups"]) {
                                return payload["cognito:groups"].indexOf(group) >= 0;
                            } else {
                                return false;
                            }
                        })

                        if (validRoles.length > 0) {
                            mythis.awsUtil.initAwsService(null, true, token);
                            loggedIn = true;
                        } else {
                            mythis.userService.logout();
                        }
                    }
                }
            });

            if (!loggedIn) {

                let toast = this.toastCtrl.create({
                    message: "This Role don't have permissions to login",
                    duration: 3000,
                    position: 'top'
                });

                toast.present();
            } else {
                this.router.navigate(['']);
            }
        }
    }
}