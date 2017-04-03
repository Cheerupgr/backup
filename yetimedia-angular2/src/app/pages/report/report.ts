import { Component } from '@angular/core';
import { AuthGuard } from '../../auth-guard.service';

@Component({
    selector: 'page-report',
    templateUrl: 'report.html'
})
export class ReportPage {
    constructor(private auth: AuthGuard) {
        console.log('HOmepage');
    }

    logOut() {
        this.auth.logOut();
    }

}
