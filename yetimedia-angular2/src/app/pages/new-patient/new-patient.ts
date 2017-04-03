import { Component } from '@angular/core';
import { ToastController, LoadingController } from 'ionic-angular';
import { AuthGuard } from '../../auth-guard.service';

import { UserRegistrationService, CognitoCallback } from "../../shared/cognito.service";
import { UUID } from 'angular2-uuid';
import { Patient } from '../../patient/patient';
import { PatientDB } from '../../patient/patientDB';
import { PatientStatus } from '../../patient/patient-status'
import { S3service } from '../../shared/s3.service'

import { GroupService } from '../../services/group.service';
import { PatientService } from '../../services/patient.service';
import { GroupPatientService } from '../../services/group_patient.service';


@Component({
    selector: 'page-new-patient',
    templateUrl: 'new-patient.html'
})
export class NewPatient {
    public newpatient:Patient = {name:'', email:'', userid:"", address:'', phoneH:'', phoneC:'', photo:'/assets/profilepng/default.png', medicare:'',
          status: new PatientStatus(), ssn:'', servicingOfficeLocation:'', dnrOnFile:false, groups:[]};
    public patientList: Array<Patient>;

    public dnrlist = [{name:'YES', value: true}, {name: 'NO', value: false}];
    public medicalHistoryList:any = ['Low Blood Sugar', 'Memory Loss', 'High Bllod Pressure', 'BCK Pain'];
    public groupList:any =["Dementia", "Diabetes", "Hypertension", "Osteoporosis"];

    public uploadpatient:Patient = new Patient("", "/assets/profilepng/default.png");
    public originPhoto: any;

    public groupUpdated = false;
    public groups: any = [];

    private loading: any;


    constructor(private auth: AuthGuard,
      private toastCtrl: ToastController,
      public loadingCtrl: LoadingController,
      public userRegistration: UserRegistrationService,
      public patientDB: PatientDB,
      public s3service: S3service,
      private group: GroupService,
      private patientSvc: PatientService,
      private group_patient: GroupPatientService) {
      var nowdate = new Date();
      this.newpatient.dob = nowdate.toISOString();
      this.onGettingPatients();
    }

    showLoading (str) {
      this.loading = this.loadingCtrl.create ({
        content: str
      });
      this.loading.present();
    }

    hideLoading () {
      this.loading.dismiss();
    }

    getGroups () {
      this.showLoading('Loading...');
      this.groupUpdated = false;
      this.group.getGroups().subscribe(
        data => {
          this.hideLoading();
          if (data.result) {
            this.groups = data.res.Items;
            this.groupUpdated = true;
          } else {

          }
        }
      );
    }

    ngOnInit () {
        this.getGroups();
    }

    onGettingPatients(){
      this.patientDB.all().then((patients: Array<Patient>) => {
          this.patientList = patients;
      });
    }

    onSelectDnrList(type){
        this.newpatient.dnrOnFile = type.value;
    }

    s3serviceCallback(message: string, result: any) {
        if (message != null) { //error
            let toast = this.toastCtrl.create({
                message: "Photo upload failed",
                duration: 6000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                console.log('Dismissed toast');
            });

            toast.present();
        } else { //success
          this.uploadpatient.photo = result.Location;
          this.onUploadPatient();
        }
    }

    profileSave(){

      this.showLoading('Saving profile ...');

      if(this.newpatient.email!=''){
        var patient = this.patientList.filter(patient => patient.email === this.newpatient.email);

        if(patient.length>0){
          let toast = this.toastCtrl.create({
              message: "Patient Exist",
              duration: 3000,
              position: 'top'
          });
          toast.present();
        } else {
          if(this.newpatient.photo !="/assets/profilepng/default.png"){
            this.s3service.addPhoto(this.newpatient.photo,this.uploadpatient.id, this);
          } else {
            this.onUploadPatient();
          }
        }
      }
    }

    onUploadPatient(){
      try {
        if(this.newpatient.name !=''){
          this.uploadpatient.name = this.newpatient.name;
        }
        if(this.newpatient.email !=''){
          this.uploadpatient.email = this.newpatient.email;
        }
        if(this.newpatient.address !=''){
          this.uploadpatient.address = this.newpatient.address;
        }
        if(this.newpatient.phoneH !=''){
          this.uploadpatient.phoneH = this.newpatient.phoneH;
        }
        if(this.newpatient.phoneC !=''){
          this.uploadpatient.phoneC = this.newpatient.phoneC;
        }
        if(this.newpatient.medicare !=''){
          this.uploadpatient.medicare = this.newpatient.medicare;
        }
        if(this.newpatient.ssn !=''){
          this.uploadpatient.ssn = this.newpatient.ssn;
        }
        if(this.newpatient.dnrOnFile){
          this.uploadpatient.dnrOnFile = this.newpatient.dnrOnFile;
        }
      }
      catch(err) {
          console.log(err);
      }

      // save profile

      this.patientSvc.createPatient(this.uploadpatient)
      .subscribe(
        data => {
          if (data.result) {
            var attentedGroups = [];
            this.groups.forEach((item) => {
              if (item.attended) {
                attentedGroups.push(item);
              }
            });
            this.hideLoading();
            this.onShowResult('success');
          } else {
            this.hideLoading();
            this.onShowResult('fail');
          }
        }
      );
      // *****************************
    }

    onShowResult(result){
      if (result == 'fail') { //error
          let toast = this.toastCtrl.create({
              message: "register failed",
              duration: 3000,
              position: 'top'
          });

          toast.onDidDismiss(() => {
              console.log('Dismissed toast');
          });

          toast.present();
      } else { //success
        this.patientList.push(this.uploadpatient);

          let toast = this.toastCtrl.create({
              message: "register success",
              duration: 6000,
              position: 'top'
          });
          toast.present();
      }
    }


    fileChange(input){
        this.readFiles(input.files);
    }

    readFile(file, reader, callback){
          reader.onload = () => {
            callback(reader.result);
          }

          reader.readAsDataURL(file);
    }

    readFiles(files, index=0){
      // Create the file reader
      let reader = new FileReader();

      // If there is a file
      if(index in files){
        // Start reading this file
        this.readFile(files[0], reader, (result) =>{
          // Create an img element and add the image file data to it
          var img = document.createElement("img");
          img.src = result;
          // this.newpatient.photo = result;
          this.originPhoto = files[0];

          // Send this img to the resize function (and wait for callback)
          this.resize(img, 250, 250, (resized_jpeg, before, after)=>{

            this.newpatient.photo = resized_jpeg;
            // Read the next file;
            this.readFiles(files, index+1);
          });
        });
      }else{

      }
    }

    resize(img, MAX_WIDTH:number, MAX_HEIGHT:number, callback){
        // This will wait until the img is loaded before calling this function
        return img.onload = () => {

          // Get the images current width and height
          var width = img.width;
          var height = img.height;

          // Set the WxH to fit the Max values (but maintain proportions)
          if (width > height) {
              if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
              }
          } else {
              if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
              }
          }

          // create a canvas object
          var canvas = document.createElement("canvas");

          // Set the canvas to the new calculated dimensions
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0,  width, height);

          // Get this encoded as a jpeg
          // IMPORTANT: 'jpeg' NOT 'jpg'
          var dataUrl = canvas.toDataURL('image/jpeg');

          // callback with the results
          callback(dataUrl, img.src.length, dataUrl.length);
        };
      }
}
