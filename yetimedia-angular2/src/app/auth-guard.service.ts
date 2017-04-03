import { Injectable } from '@angular/core';
import {
    Router,
    CanActivate,
    CanActivateChild,
    ActivatedRoute,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
} from '@angular/router';

import {
    CognitoUtil,
    UserLoginService,
    LoggedInCallback
} from "./shared/cognito.service";

import { AwsUtil } from "./shared/aws.service";

import * as sjcl from 'sjcl';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, LoggedInCallback {

    constructor(
        public awsUtil: AwsUtil,
        public cognito: CognitoUtil,
        private auth: UserLoginService,
        private router: Router) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let mythis = this;

        return new Promise((resolve, reject) => {

            if (childRoute.data["authorizedRoles"].indexOf('all') >= 0) {
                resolve(true)
                return;
            }

            mythis.cognito.getIdToken({
                callback() { },
                callbackWithParam(token: any) {

                    if (token) {

                        let groups = mythis.getGroupsFromToken(token);

                        let validRoles = childRoute.data["authorizedRoles"].filter(function (group) {
                            return groups.indexOf(group) >= 0;
                        })

                        if (validRoles.length > 0) {
                            resolve(true);
                        } else {
                            reject(false);
                        }

                    } else {
                        reject(false);
                    }
                }
            });
        }).then((authorized) => {
            return authorized;
        }).catch((notAuthorized) => {
            return notAuthorized;
        })
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let mythis = this, groups = [];

        return new Promise((resolve, reject) => {

            mythis.cognito.getIdToken({
                callback() { },
                callbackWithParam(token: any) {

                    if (token) {

                        groups = mythis.getGroupsFromToken(token);

                        let validRoles = CognitoUtil._VALID_ROLES.filter(function (group) {
                            return groups.indexOf(group) >= 0;
                        })

                        if (validRoles.length > 0) {
                            mythis.awsUtil.initAwsService(null, true, token);
                            resolve(true);
                        } else {
                            mythis.auth.logout();
                            resolve(false);
                        }

                    } else {
                        resolve(false);
                    }
                }
            });

        }).then((isLoggedIn) => {
            if (isLoggedIn) {

                if (groups.indexOf('family_members') >= 0) {
                    mythis.router.navigate(['/app/patient']);
                } else {
                    mythis.router.navigate(['/app/dashboard']);
                }

            } else {
                mythis.router.navigate(['/auth/login']);
            }

            return isLoggedIn;
        })
    }

    getGroupsFromToken(token: string): Array<string> {
        let payloadToken = token.split('.')[1];

        let payload = JSON.parse(
            sjcl.default.codec.utf8String.fromBits(
                sjcl.default.codec.base64url.toBits(payloadToken)
            )
        );

        return payload["cognito:groups"] || [];
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
    }

    logOut() {
        this.auth.isAuthenticated({
            isLoggedIn: (message: string, isLoggedIn: boolean) => {
                if (isLoggedIn) {
                    this.auth.logout();
                }

                this.router.navigate(['/auth/login']);
            }
        });
    }
}