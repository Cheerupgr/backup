import { Component , Input, Output, EventEmitter} from '@angular/core';


@Component({
    selector: 'profile-card',
    templateUrl: 'profile-card.html'
})
export class ProfileCard {

  @Input() info: any;
    constructor() {
        console.log('HOmepage');
    }



}
