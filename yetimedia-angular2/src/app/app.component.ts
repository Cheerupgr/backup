import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { AuthGuard } from './auth-guard.service';
import { App } from 'ionic-angular';
import { Router } from "@angular/router";

@Component({
    templateUrl: 'app.html'
})

export class MyApp {
    constructor(private platform: Platform,
    	public auth: AuthGuard,
    	private app: App,
      public router: Router) {
    	// this.app._setDisableScroll(false);
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
        });
    }

    logOut() {
        this.auth.logOut();
    }

    gotoHome(){
      this.router.navigate(['/app/home']);
    }
}
