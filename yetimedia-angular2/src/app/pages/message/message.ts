import { Component } from '@angular/core';
import { AuthGuard } from '../../auth-guard.service';

@Component({
    selector: 'page-message',
    templateUrl: 'message.html'
})
export class MessagePage {

  public typeList:any;
  public patientType: any = "Patients";
  public typeClickedFlag:boolean = false;
  public patientList:any;
  public clickedListFlags:any = 0;
  public selectedPerson:any;
  public messageList:any;

    constructor(private auth: AuthGuard) {
        this.typeList = [{name: "Patients", key: 1}, {name: "Admins", key: 2},{name: "Caregivers", key: 3},{name: "Doctors", key: 4},{name: "Family Members", key: 5}];
        this.patientList = [{firstName:"Jane", lastName:"Adams", status:0, image:1, age:77},
        {firstName:"Eric",lastName:"Adamson", status:1, image:2, age:76},
        {firstName:"Don",lastName:"Adamson", status:2, image:2, age:75},
        {firstName:"Fran",lastName:"Anderson", status:1, image:3, age:82},
        {firstName:"Don",lastName:"Anderson", status:0, image:4, age:84},
        {firstName:"Greg",lastName:"Angelo", status:2, image:5, age:87},
        {firstName:"Harold",lastName:"Angelo", status:1, image:6, age:87},
        {firstName:"Ruth",lastName:"Baker", status:2, image:7, age:73},
        {firstName:"Steve",lastName:"Baker", status:2, image:7, age:73},
        {firstName:"Adam",lastName:"Baum", status:2, image:8, age:82},
        {firstName:"Michael",lastName:"Baum", status:2, image:8, age:82},
        {firstName:"Eric",lastName:"Black", status:2, image:1, age:90},
        {firstName:"Harold",lastName:"Black", status:2, image:9, age:77},
        {firstName:"Harold",lastName:"Bloom", status:0, image:10, age:78},
        {firstName:"Michael",lastName:"Bloom", status:0, image:10, age:78},
        {firstName:"Oscar",lastName:"Bonito", status:0, image:11, age:88},
        {firstName:"Steve",lastName:"Bonito", status:1, image:12, age:89},
        {firstName:"Alice",lastName:"Cabb", status:2, image:1, age:94},
        {firstName:"Sandra",lastName:"Cagney", status:1, image:14, age:90},
        {firstName:"Alice",lastName:"Callor", status:1, image:15, age:78},
        {firstName:"Tamara",lastName:"Callor", status:1, image:15, age:78},
        {firstName:"Steve",lastName:"Campbell", status:1, image:1, age:89},
        {firstName:"Darrell",lastName:"Carter", status:2, image:2, age:91},
        {firstName:"Steve",lastName:"Carter", status:2, image:2, age:91}

      ];

      this.selectedPerson = this.patientList[this.clickedListFlags];
      this.messageList = [
        {type:0, content:"Good morning?", date:"2 months ago"},
        {type:1, content:"How are you and how is patient this morning?", date:"a month ago"},
        {type:0, content:"Hello, I'm doing well.", date:"a month ago"},
        {type:0, content:"I'm checking on a few things. Should have an update for you in regards to the patient shortly.", date:"10 days ago"},
        {type:1, content:"Hello, What is the prognosis of the patient today?", date:"9 days ago"},

        {type:1, content:"Please advise.", date:"9 days ago"},
        {type:0, content:"I will get back to you soon", date:"9 days ago"},
        {type:1, content:"Hello, How is the patient this morning?", date:"8 days Angelo"},
        {type:1, content:"Hello, How are you?", date:"8 days ago"},
        {type:0, content:"Hello, How are you?", date:"3 days ago"},

        {type:0, content:"Hello, How are you?", date:"3 days ago"},
        {type:1, content:"Hello, How are you?", date:"2 days ago"},
        {type:0, content:"Hello, How are you?", date:"5 hours ago"},
        {type:1, content:"Hello, How are you?", date:"5 hours ago"},
        {type:0, content:"Hello, How are you?", date:"3 hours ago"},
        {type:0, content:"Hello, How are you?", date:"an hour ago"},
        {type:1, content:"Hello, How are you?", date:"10 mins ago"},
        {type:1, content:"Hello, How are you?", date:"1 min ago"}

      ];
    }

    onClickList(i:any, type:any){
      this.clickedListFlags = i;
      this.selectedPerson = this.patientList[this.clickedListFlags];
    }

    presentPopover(){

      this.typeClickedFlag = !this.typeClickedFlag;
    }

    onSelectType(type:any){
      this.patientType = type.name;
      this.typeClickedFlag = !this.typeClickedFlag;
    }

    logOut() {
        this.auth.logOut();
    }

}
