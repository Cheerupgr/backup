import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from 'ionic-angular';

import { AuthRoutingModule } from "./auth.routes"

import { Unauthenticated } from "./unauthenticated.service"
import { Authenticated } from "./authenticated.service"

import { AuthComponent } from "./auth.component"

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/registration.component";
import { ForgotPasswordStep1Component, ForgotPassword2Component } from "./forgot/forgotPassword.component";
import { LogoutComponent, RegistrationConfirmationComponent } from "./confirm/confirmRegistration.component";
import { ResendCodeComponent } from "./resend/resendCode.component";

@NgModule({
    declarations: [
        LoginComponent,
        LogoutComponent,
        RegistrationConfirmationComponent,
        ResendCodeComponent,
        ForgotPasswordStep1Component,
        ForgotPassword2Component,
        RegisterComponent,
        AuthComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AuthRoutingModule
    ],
    exports: [
    ],
    providers: [
        Authenticated,
        Unauthenticated
    ]
})

export class AuthModule { }
