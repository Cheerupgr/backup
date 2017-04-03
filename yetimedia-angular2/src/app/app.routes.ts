import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from './auth-guard.service'
// import { HomePage } from './home/home';
import { DashboardPage } from './dashboard/dashboard';
import { LeftSidebar } from './left-sidebar/left-sidebar';
import { Header } from './header/header';

import { PatientPage } from './pages/patient/patient';
import { PatientListPage } from './pages/patient-list/patient-list';
import { ReportPage } from './pages/report/report';
import { MessagePage } from './pages/message/message';
import { ProfilePage } from './pages/profile/profile';
import { NewCaregiver } from './pages/new-caregiver/new-caregiver';
import { NewPatient } from './pages/new-patient/new-patient';

const routes: Routes = [
    {
        path: 'app', canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [
            {
                path: 'patient',
                component: PatientPage,
                data: {
                    authorizedRoles: ['all']
                }
            },
            {
                path: 'directory',
                component: PatientListPage,
                data: {
                    authorizedRoles: ['admin', 'doctor', 'caregiver']
                }
            },
            {
                path: 'report',
                component: ReportPage,
                data: {
                    authorizedRoles: ['admin', 'doctor', 'caregiver']
                }
            },
            {
                path: 'message',
                component: MessagePage,
                data: {
                    authorizedRoles: ['all']
                }
            },
            {
                path: 'profile',
                component: ProfilePage,
                data: {
                    authorizedRoles: ['all']
                }
            },
            {
                path: 'dashboard',
                component: DashboardPage,
                pathMatch: 'full',
                data: {
                    authorizedRoles: ['admin', 'doctor', 'caregiver']
                }
            },
            {
                path: 'new-caregiver',
                component: NewCaregiver,
                pathMatch: 'full',
                data: {
                    authorizedRoles: ['admin', 'doctor', 'caregiver']
                }
            },
            {
                path: 'new-patient',
                component: NewPatient,
                pathMatch: 'full',
                data: {
                    authorizedRoles: ['admin', 'doctor', 'caregiver']
                }
            },
            {
                path: '',
                component: LeftSidebar,
                outlet: 'left-sidebar',
                data: {
                    authorizedRoles: ['all']
                }
            },
            {
                path: '',
                component: Header,
                outlet: 'header',
                data: {
                    authorizedRoles: ['all']
                }
            }
        ],
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'app/dashboard'
    }
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})

export class AppRoutingModule { }
