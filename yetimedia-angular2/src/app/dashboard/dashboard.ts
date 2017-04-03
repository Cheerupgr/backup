import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';

import { AuthGuard } from '../auth-guard.service';
import { GroupService } from '../services/group.service';
import { PatientService } from '../services/patient.service';
import { GroupPatientService } from '../services/group_patient.service';

import { Router } from "@angular/router";
// import { Chart } from 'chart.js';
import { PopoverController } from 'ionic-angular';
import { CreteGroupPopover } from '../popups/create-group/create-group';

@Component({
    selector: 'page-dashboard',
    templateUrl: 'dashboard.html'
})
export class DashboardPage {
    statsByTime: string = "week";
    lineChart: any;
    public groups: any = [];
    public groupUpdated = false;

    constructor(private auth: AuthGuard,
        private group: GroupService,
        private patient: PatientService,
        private group_patient: GroupPatientService,
        public menu: MenuController,
        public router: Router,
        public popoverCtrl: PopoverController) {
        menu.enable(true);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DashboardPage');
    }

    ngOnInit() {
        this.getGroups();
    }

    gotoPatient(){
      this.router.navigate(['./app/patient']);
    }

    // ionViewDidLoad() {

    // 	  this.lineChart = new Chart(this.lineCanvas.nativeElement, {

    // 		    type: 'line',
    // 		    data: {
    // 		        labels: ["S", "M", "T", "W", "T", "F", "S"],
    // 		        datasets: [{
    // 			      label: 'Vitals',
    // 			      fill: false,
    // 			      data: [12, 19, 3, 17, 6, 3, 7],
    // 			      borderColor : "#3EBC34",
    // 			      backgroundColor: "#3EBC34",
    // 			      pointBorderColor: "#3EBC34",
    // 			      lineTension : 0,
    // 			      pointRadius: 2,
    // 			      borderWidth: 2,
    // 			      pointBorderWidth: 7
    // 			   },
    // 			    {
    // 			      label: 'Physical',
    // 			      fill: false,
    // 			      data: [2, 29, 5, 5, 2, 3, 10],
    // 			      borderColor : "#FB7828",
    // 			      backgroundColor: "#FB7828",
    // 			      pointBorderColor: "#FB7828",
    // 			      lineTension : 0,
    // 			      pointRadius: 2,
    // 			      borderWidth: 2,
    // 			      pointBorderWidth: 7
    // 			    }]
    // 		    },
    // 		    options: {
    // 		        responsive: true,
    // 		        maintainAspectRatio: false,
    // 		        legend: {
    // 		            display: true,
    // 		            labels: {
    // 		                boxWidth:15,
    // 		                usePointStyle:true
    // 		            }
    // 		        }
    // 		    }

    // 		});
    // 	}

    logOut() {
        this.auth.logOut();
    }

    getPatientsForGroups () {
      this.groupUpdated = false;
      if (this.groups.length) {
        var param : any = {};
        this.groups.forEach(group => {
          param.group_id = group.id;

          // get patients for each group

          this.patient.getPatients(param)
          .subscribe(
            data => {
              if (data.result) {
                this.groupUpdated = true;

                // update patient data in scope group varialble
                if (data.res.Items.length) {
                  group.patients = data.res.Items;
                }
              } else {
                console.log(data);
              }
            }
          );
        });
      }
    }

    getGroups () {
      this.groupUpdated = false;
      this.group.getGroups().subscribe(
        data => {
          console.log(data)
          if (!data) {
            return;
          }
          this.groups = data.res.Items;
          this.getPatientsForGroups();
          // this.groupUpdated = true;
        },
        error => {
          console.log(error);
          this.groupUpdated = true;
        }
      );
    }

    createGroup () {
      let popover = this.popoverCtrl.create(CreteGroupPopover, {
        groups: this.groups
      }, {
        cssClass: 'create-group'
      });

      popover.onDidDismiss(dataFromPopover => {
        if (dataFromPopover) {
          if (dataFromPopover.groupToAdd != null) {

            // create group

            this.group.createGroup(dataFromPopover.groupToAdd).subscribe(
              data => {
                var group_id = data.item.id;
                if (dataFromPopover.patientToAdd) {

                  // create patient

                  this.patient.createPatient(dataFromPopover.patientToAdd)
                  .subscribe(
                    data => {
                      var group_patient_obj = {
                        group_id: group_id,
                        patient_id: data.item.id
                      };

                      // add patient to group

                      this.group_patient.createGroupPatient(group_patient_obj)
                      .subscribe(
                        data => {
                          this.getGroups();
                        },
                        error => {
                          console.log(error);
                        }
                      );
                    },
                    error => {
                      console.log(error);
                    }
                  );
                } else {
                  this.getGroups();
                }
              },
              error => {
                console.log(error);
              }
            );
          }

          if (dataFromPopover.groupsToRemove.length > 0) {
            dataFromPopover.groupsToRemove.forEach((item, index) => {
              // delete group
              this.group.deleteGroup(item).subscribe(
                data => {
                  this.getGroups();
                },
                error => {
                  console.log(error);
                }
              );
            });
          }
        }
      });

      popover.present();
    }
}
