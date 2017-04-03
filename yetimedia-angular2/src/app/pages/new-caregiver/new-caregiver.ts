import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { AuthGuard } from '../../auth-guard.service';
import { User } from '../../model/user';
import { Admin } from '../../model/admin';
import { Caregiver } from '../../model/caregiver';
import { Doctor } from '../../model/doctor';
import { FamilyMember } from '../../model/family-member';
import { Nurse } from '../../model/nurse';
import { Role } from "../../model/role";
import { SpecialistType } from "../../model/specialist-type";
import { UserRegistrationService, CognitoCallback } from "../../shared/cognito.service";
import { UUID } from 'angular2-uuid';
import { S3service } from '../../shared/s3.service'


@Component({
    selector: 'page-new-caregiver',
    templateUrl: 'new-caregiver.html'
})
export class NewCaregiver {
  public roleType:any ="Select Role";
  public roleList:any;
  public patientList:any = [];
  public patientOriList:any = [];
  public roleClickedFlag:boolean = false;
  public patientClickedFlag:boolean = false;

  // public newuser: User = {name:'', email:'', password:'', userid:"", group:"Select Role", patients:[]};
  public newAdmin:Admin = {id:'', name:'', email:'', password:'', userid:"", address:'', phoneH:'', phoneC:'', photo:'', role:Role.ADMIN};
  public newcaregiver: Caregiver = {id:'', name:'', email:'', password:'', userid:"", address:'', phoneH:'', phoneC:'', photo:'', patientsList:[], role:Role.CAREGIVER};
  public newNurse: Nurse = {id:'', name:'', email:'', password:'', userid:"", address:'', phoneH:'', phoneC:'', photo:'', role:Role.NURSE};
  public newDoctor: Doctor = {id:'', name:'', email:'', password:'', userid:"", address:'', phoneH:'', phoneC:'', photo:'', role:Role.DOCTOR, specialistType:SpecialistType.CARDIOLOGIST};
  public totalUser:any = [];
  public selectedRole:any = {name: "Caregiver", key: 1};
  public selectedUser:any;
  public specialList:any = SpecialistType.ALL;
  public searchQuery:string = '';
  public originPhoto: any;


  constructor(private auth: AuthGuard,
      private toastCtrl: ToastController,
    public userRegistration: UserRegistrationService,
    public s3service: S3service) {
      this.totalUser = [this.newcaregiver, this.newDoctor, this.newNurse, this.newAdmin];
      this.selectedUser = this.totalUser[this.selectedRole.key - 1];
      this.getRoleList();
      this.getPatientList();



    }
    getRoleList(){
      this.roleList = [{name: "Caregiver", key: 1}, {name: "Doctor", key: 2},{name: "Nurse", key: 3},
      {name: "Admin", key: 4},{name: "Case Manager", key: 5},{name: "Care Team Coordinator", key: 6},{name: "Family Member", key: 7}];
      // this.selectedRole = this.roleList[0];
    }
    getPatientList(){
      this.patientOriList = [{fname: "Jane", lname:"Adams", key: 1}, {fname: "Eric", lname:"Adamson", key: 2},{fname: "Fran", lname:"Anderson", key: 3},
      {fname: "Ruth", lname:"Baker", key: 4},{fname: "Adam", lname:"Baum", key: 5},{fname: "Michael", lname:"Bloom", key: 6},{fname: "Steve", lname:"Campbell", key: 7},
      {fname: "Darrell", lname:"Carter", key: 8},{fname: "Victor", lname:"Curtis", key: 9}];
      this.patientList = this.patientOriList;
    }

    onInput(event){
      console.log("aaa");
      // this.patientOriList.search(this.searchQuery).then(data => {
      //   this.patientList = data;
      // });
        var q = this.searchQuery;


        // if the value is an empty string don't filter the items
        if (!q) {
            this.patientList = this.patientOriList;
          return;
        }

        this.patientList = this.patientOriList.filter((v) => {
          let aa = v.fname+' '+v.lname;
          if(aa && q) {
            if (aa.toLowerCase().indexOf(q.toLowerCase()) > -1) {
              return true;
            }
            return false;
          }
        });
    }


    openRole(){
      this.roleClickedFlag = !this.roleClickedFlag;
    }

    onSelectRole(role:any){
      this.selectedRole = role;
      this.selectedUser = this.totalUser[this.selectedRole.key - 1];
      this.roleClickedFlag = !this.roleClickedFlag;
    }

    openPatientList(){
      this.patientClickedFlag = !this.patientClickedFlag;
    }
    onSelectPatient(patient){
      this.selectedUser.patientsList.push(patient);
      this.patientClickedFlag = !this.patientClickedFlag;
    }
    onSelectSpecialList(type){
      this.selectedUser.specialistType = type;
    }

    profileSave(){
      this.selectedUser.userid = UUID.UUID();
      this.s3service.addPhoto(this.originPhoto,this.selectedUser.userid, this);

    }

    onUploadCaregivier(){
      this.userRegistration.register(this.selectedUser, this);
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
          this.selectedUser.photo = result.Location;
          this.onUploadCaregivier();
        }
    }
    cognitoCallback(message: string, result: any) {

      console.log("message", message);
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
            this.userRegistration.addToGroup(this.selectedUser);
            let toast = this.toastCtrl.create({
                message: "register success",
                duration: 6000,
                position: 'top'
            });
            toast.present();
            // console.log("role=", this.selectedUser.role);
            console.log("redirecting");
            // this.router.navigate(['/session/confirmRegistration', result.user.username]);
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
          this.selectedUser.photo = result;
          this.originPhoto = files[0];


          // Send this img to the resize function (and wait for callback)
          // this.resize(img, 250, 250, (resized_jpeg, before, after)=>{
          //
          //   this.selectedUser.photo = resized_jpeg;
          //   // Read the next file;
          //   this.readFiles(files, index+1);
          // });
        });
      }else{
        // When all files are done This forces a change detection
        // this.changeDetectorRef.detectChanges();
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
