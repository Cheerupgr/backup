import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/registration.component";
import { ForgotPassword2Component, ForgotPasswordStep1Component } from "./forgot/forgotPassword.component";
import { RegistrationConfirmationComponent } from "./confirm/confirmRegistration.component";
import { ResendCodeComponent } from "./resend/resendCode.component";

import { Unauthenticated } from "./unauthenticated.service"
import { Authenticated } from "./authenticated.service"

const routes: Routes = [
    {
        path: 'auth', canActivate: [Unauthenticated], children: [
            { path: 'login', component: LoginComponent },
            { path: 'confirmRegistration/:username', component: RegistrationConfirmationComponent },
            { path: 'resendCode', component: ResendCodeComponent },
            { path: 'forgotPassword/:email', component: ForgotPassword2Component },
            { path: 'forgotPassword', component: ForgotPasswordStep1Component }
        ]
    },
    {
        path: 'app', canActivate: [Authenticated], children: [
            { path: 'register', component: RegisterComponent }
        ]
    }
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class AuthRoutingModule { }
