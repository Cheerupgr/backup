import { Component } from '@angular/core';
import { PopoverController } from 'ionic-angular';
import { Patient } from '../../patient/patient';
import { PatientDB } from '../../patient/patientDB';
import { Router } from "@angular/router";
// import { AuthGuard } from '../../auth-guard.service';

@Component({
    selector: 'page-patient-list',
    templateUrl: 'patient-list.html'
})
export class PatientListPage {
    public typeList: any;
    public patientList: Array<Patient>;
    public pagepatientList: any = [];
    public pageCountList: any = [];
    public typeClickedFlag: boolean = false;
    public countClickedFlag: boolean = false;
    public patientType: any = "Patients";
    public countofRecord: any = 15;
    public recordFirst: any = 1;
    public recordLast: any;

    public pageorder: any = 1;

    constructor(
        private popoverCtrl: PopoverController,
        public patientDB: PatientDB,
        public router: Router) {

        this.typeList = [
            { name: "Patients", key: 1 },
            { name: "Admins", key: 2 },
            { name: "Caregivers", key: 3 },
            { name: "Doctors", key: 4 },
            { name: "Family Members", key: 5 }
        ];

        this.patientList = new Array<Patient>();

        this.patientDB.all().then((patients: Array<Patient>) => {

            this.patientList = patients;

            patients.map((patient) => {
              if(patient.photo == ''){
                patient.photo = "/assets/profilepng/default.png";
              }

                patient.status = { name: Math.floor(Math.random() * 2).toString() };
            });

            this.pageCountList = [{ count: 15 }, { count: 24 }];

            if (this.patientList.length < this.countofRecord) {
                this.recordLast = this.patientList.length;
            } else {
                this.recordLast = this.countofRecord;
            }

            this.makingPagepatientList();
        });
    }

    presentPopover() {
        this.typeClickedFlag = !this.typeClickedFlag;
    }

    onSelectType(type: any) {
        this.patientType = type.name;
        this.typeClickedFlag = !this.typeClickedFlag;
    }

    openCountList() {
        this.countClickedFlag = !this.countClickedFlag;
    }

    onSelectCount(count: any) {

        this.countClickedFlag = !this.countClickedFlag;
        if (this.countofRecord != count.count) {
            this.pageorder = 1;
        }
        this.countofRecord = count.count;
        this.compareRecordCount();
    }

    backPage() {
        if (this.pageorder > 1) {
            this.pageorder--;
            this.compareRecordCount();
        }
    }
    nextPage() {
        if (this.pageorder * this.countofRecord < this.patientList.length) {
            this.pageorder++;
            this.compareRecordCount();
        }
    }

    compareRecordCount() {
        this.recordFirst = (this.pageorder - 1) * this.countofRecord + 1;
        this.recordLast = this.pageorder * this.countofRecord;
        if (this.recordLast > this.patientList.length) {
            this.recordLast = this.patientList.length;
        }

        this.makingPagepatientList();
    }

    makingPagepatientList() {
        this.pagepatientList = [];
        let index = 0;
        this.pagepatientList[index] = [];
        for (var ii = this.recordFirst - 1; ii < this.recordLast; ii++) {

          // this.pagepatientList[index].push(this.patientList[ii]);
          try{
            if(this.patientList[ii].name[0]!=this.patientList[ii+1].name[0]){
              this.pagepatientList[index].push(this.patientList[ii]);
              index++;
              this.pagepatientList[index] = [];
            } else {
              this.pagepatientList[index].push(this.patientList[ii]);
            }

          } catch(e) {
              this.pagepatientList[index].push(this.patientList[ii]);
              console.log(e.status);
          }

        }
    }

    onChange(type: any) {

    }

    gotoPatientpage(patient){
      this.router.navigate(['./app/patient']);
    }


}
