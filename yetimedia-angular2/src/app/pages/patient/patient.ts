import { Component } from '@angular/core';
import { AuthGuard } from '../../auth-guard.service';

@Component({
    selector: 'page-patient',
    templateUrl: 'patient.html'
})
export class PatientPage {
  public profileInfo:any;
  public profileCareTeam:any;
  public activityClickedFlag:any = 1;
  public medicalhistoryList:any;
  public careactivityList: any;
  public allergiesList: any;
  public medicationList: any;
  public groupList:any;
  public contactsList:any;
  public filesList:any;
    constructor(private auth: AuthGuard) {
        console.log('HOmepage');
        this.profileInfo = {
          firstName: "Adam",
          lastName: "Baum",
          address: "321 Rose Ct, Palo Alto",
          birthday: "July 22, 1934",
          age: "82",
          phoneNumber: "(999)999-9999",
          status: "Non-Hospice",
          diagnosis: "High Blood Pressure"
        };

        this.profileCareTeam = [
          {img:"1", name:"Michael Cook"},
          {img:"2", name:"Amber Johnson"},
          {img:"3", name:"Dr. John Green"}
        ];

        this.medicalhistoryList = [{name:"Hypertension", type:"Often"},
                        {name:"Chest pain", type:"Seldom"},
                        {name:"Heart Attack", type:"June 2009"},
                      ];
        this.careactivityList = [{date:"11/15/16",type:"Hospital", name:"Hoag Hospital", status:"Discharged"},
                        {date:"11/12/16",type:"Hospital", name:"Hoag Hospital", status:"Admitted"},
                        {date:"10/28/16",type:"SNF", name:"Brookdale", status:"Discharged"},
                        {date:"10/28/16",type:"LTACH", name:"Brookdale", status:"Released"},
                        {date:"08/18/16",type:"Homecare", name:"Tethercare", status:"Intake"}
                      ];
        this.allergiesList = [{name:"Nuts"}, {name:"Grapefruit"}, {name:"Penicillin"}];
        this.medicationList = [{name:"Atenolol"}, {name:"Aspirin"}, {name:"Paxil"}];
        this.groupList =[{name:"Hypertension"},{name:"Cardiovascular Disease"}];
        this.contactsList = [];
        this.filesList =[{name:"8P Screen Tool..."}];
    }
    onActivityTab(index: any){
      this.activityClickedFlag = index;
    }
    logOut() {
        this.auth.logOut();
    }

}
