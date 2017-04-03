import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';


import { AppRoutingModule } from './app.routes';

import { MyApp } from './app.component';

// import { HomePage } from './home/home';
import { DashboardPage } from './dashboard/dashboard';
import { LeftSidebar } from './left-sidebar/left-sidebar';
import { Header } from './header/header';
import { DropdownMenuPopover } from './header/dropdown-menu/dropdown-menu';

import { PatientPage } from './pages/patient/patient';
import { PatientListPage } from './pages/patient-list/patient-list';
import { ReportPage } from './pages/report/report';
import { MessagePage } from './pages/message/message';

import { ProfilePage } from './pages/profile/profile';

// popover pages for profile page
import { EditPatientPopover } from './pages/profile/edit-patients/edit-patients';
import { ListSchedulePopover } from './pages/profile/list-schedule/list-schedule';
import { EditSchedulePopover } from './pages/profile/edit-schedule/edit-schedule';
import { EditTaskPopover } from './pages/profile/edit-task/edit-task';

import { NewCaregiver } from './pages/new-caregiver/new-caregiver';
import { NewPatient } from './pages/new-patient/new-patient';



import { ProfileCard } from './components/profile-card/profile-card';

import { AuthGuard } from './auth-guard.service';
import { GroupService } from './services/group.service';
import { PatientService } from './services/patient.service';
import { GroupPatientService } from './services/group_patient.service';

import { AuthModule } from './auth/auth.module';
import { PatientModule } from './patient/patient.module';

import { AwsUtil } from "./shared/aws.service";
import { S3service } from "./shared/s3.service";
import { UserRegistrationService, UserLoginService, CognitoUtil } from "./shared/cognito.service";


// global popovers

import { CreteGroupPopover } from './popups/create-group/create-group';

@NgModule({
    declarations: [
        MyApp,
        //        HomePage,
        DashboardPage,
        LeftSidebar,
        Header,
        DropdownMenuPopover,
        PatientPage,
        PatientListPage,
        ReportPage,
        MessagePage,
        ProfilePage,
        EditPatientPopover,
        ListSchedulePopover,
        EditSchedulePopover,
        EditTaskPopover,
        ProfileCard,
        NewCaregiver,
        NewPatient,
        CreteGroupPopover
    ],
    imports: [
        IonicModule.forRoot(MyApp),
        AppRoutingModule,
        AuthModule,
        PatientModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
      DropdownMenuPopover,
      EditPatientPopover,
      ListSchedulePopover,
      EditSchedulePopover,
      EditTaskPopover,
      CreteGroupPopover
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        AuthGuard,
        GroupService,
        PatientService,
        GroupPatientService,
        CognitoUtil,
        AwsUtil,
        UserLoginService,
        UserRegistrationService,
        S3service
    ]
})

export class AppModule { }
