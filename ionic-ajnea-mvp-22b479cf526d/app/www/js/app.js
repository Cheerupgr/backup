// Ionic Starter App
angular.module('starter', ['ionic','ionic.cloud', 'controllers', 'services', 'ngStorage','LocalStorageModule','directives', 'pascalprecht.translate', 'ngSanitize', 'ngCookies', 'ngCordova', 'ngCordovaOauth', 'ionic-ratings'])

// Amazon address: 54.200.34.170 // Amazon address: 54.200.34.170 or http://172.31.29.136 or 54.149.59.167

  .constant("server", { url: "http://54.149.59.167", port: "8080" })

  //.constant("server", { url: "http://localhost", port: "8080"})
  .constant("offlineDataFile", "data")
  .constant("clientVersion", "0.0")
  .constant("dataLogStorage","https://s3-us-west-1.amazonaws.com/victoriseappdata/")
  .config(function($ionicCloudProvider) {
    $ionicCloudProvider.init({
      "core": {
        "app_id": "com.ajnea.victoriseapp"
      }
    });
  })
  .filter('TestUp', function () {
    return function (item) {
      return item.toUpperCase();
    };
  })
  .filter('convertDistance', function () {
    return function (value, unit) {
      if (unit  =="metric"){
        value = value* 0.001;
      }else{
        value =  value/ 1609.3435;
      }
      return value.toFixed(1);
    };
  })

  .filter('convertSpeed', function () {
    return function (value, unit) {
      if (value == null) value = 0;
      var convertedValue = value;
      if (unit  =="metric"){
        convertedValue = convertedValue* 3.6;
      }else{
        convertedValue =  convertedValue* 2.23694;
      }
      if (isNaN(value) == false) {
        return convertedValue.toFixed(1);
      }else {
        return value;
      }
    };
  })
  .filter('convertTime', function () {
    return function (clock, style) {
      if (!style) style = 1;
      if(clock<0)clock=0;
      // clock = Math.abs(clock)
      if (clock){
        seconds = Math.floor((clock/1000) % 60);
        minutes = Math.floor((clock/60000) % 60);
        hours = Math.floor((clock/3600000) % 24);
        var output = "";
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        if(style == 1){
        output = hours + "h";
        output += minutes + "m";
        output += seconds+"s";
        }

        if(style ==2){
          if(hours!="00") output = hours + "h";
          if(minutes!="00" || hours!="00") output += minutes + "m";
          if(seconds!="00") output += seconds+"s";
        }

        if(style ==3){
          output = hours + ":";
          output += minutes + ":";
          output += seconds+"";
        }

        return output;
      }else{
        return;
      }
    };
  })

  .filter('convertElevatiom', function () {
    return function (value, unit) {
      if (typeof value == 'undefined' || value == null) value = 0;
      if (unit  !="metric"){
        value =  value* 3.28084;
      }
      value = value.toFixed(1);
      return value ;
    };
  })
  .filter('searchFor', function(){
    return function(arr, searchString){
        if(!searchString){
            return arr;
        }
        var result = [];
        searchString = searchString.toLowerCase();
        angular.forEach(arr, function(marketItem){
            if(marketItem.activity.name.toLowerCase().indexOf(searchString) !== -1){
            result.push(marketItem);
        }
        if(marketItem.activity.notifications.length==parseInt(searchString) || marketItem.activity.notifications.length==parseFloat(searchString) ){
            result.push(marketItem);
        }
       /* if(marketItem.activity.info.completedTime==parseInt(searchString)){
            result.push(marketItem);
        }*/
        if(marketItem.activity.info.distance==parseInt(searchString) || marketItem.activity.info.distance==parseFloat(searchString)){
            result.push(marketItem);
        }
        if(marketItem.activity.activityType.toLowerCase().indexOf(searchString) !== -1){
            result.push(marketItem);
        }

        });
        return result;
    };
})

  .filter('round', function () {
    return function (item) {
      item = Math.round(item *10)/10;
      return item;
    };
  })
  .filter('cut', function () {
    return function (value, wordwise, max, tail) {
      if (!value) return '';

      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;
      if (typeof value == 'string'){
      value = value.substring(0, max);
        if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace != -1) {
            //Also remove . and , so its gives a cleaner result.
            if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
              lastspace = lastspace - 1;
            }
            value = value.substring(0, lastspace);
          }
        }
      }

      return value + (tail || ' �');
    };
  })




.run(function($ionicPlatform) {


    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.hide();
        }

        // Full screen mode
        ionic.Platform.isFullScreen = true;
        // Hide navigation bar if needed
        if (window.navigationbar) {
            window.navigationbar.setUp(true);
            window.navigationbar.hide();
        }




    });//ionicPlatform.ready
})


.config(function($stateProvider, $urlRouterProvider, $translateProvider, $httpProvider, $ionicConfigProvider, localStorageServiceProvider) {

    // If we get a 403 response from a request, redirect to login page by using the 'responseObserver' service
    $httpProvider.interceptors.push('responseObserver');

    $ionicConfigProvider.tabs.style('striped').position('bottom');


    // Here we define all the routes
    $stateProvider
    .state('onBoarding', {
        url: '/onBoarding',
        templateUrl: './templates/onBoardingPage.html',
        controller: 'OnBoardingCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: './templates/login.html',
        //cache: true,
        controller: 'LoginCtrl'
    })

    .state('newAccount', {
        url: '/newAccount',
        templateUrl: './templates/newAccount.html',
        controller: 'NewAccountCtrl'
    })


    .state('menu', {
        url: '/menu',
        abstract: true,
        cache: false,
        templateUrl: './templates/menu.html',
        controller: 'MenuCtrl'
    })

    .state('menu.myAccount', {
        url: '/myAccount',
        cache: false,
        views: {
            'tab-createActivity': {
                templateUrl: './templates/myAccount.html',
                controller: 'MyAccountCtrl'
            }
        }
    })


    .state('menu.bleConnect', {
        url: '/bleConnect',
        cache: false,
        views: {
            'tab-createActivity': {
                templateUrl: 'templates/bleConnect.html',
                controller: 'bleConnectCtrl'
            }
        }
    })

    .state('menu.myActivitiesList', {
        url: '/myActivitiesList',
        cache: false,
        views: {
            'tab-playActivity': {
                templateUrl: './templates/myActivitiesList.html',
                controller: 'myActivitiesListCtrl'
            }
        }
    })

    .state('menu.CreateActivity', {
        url: '/CreateActivity',
        cache: true,
        params: {newTag: null, userID: null, isClockStarted: null, reload: false},
        views: {
            'tab-createActivity': {
                templateUrl: './templates/createActivity.html',
                controller: 'CreateActivityCtrl'
            }
        }
    })

    .state('menu.addNotification', {
        url:'/addNotification',
        cache: false,
        params:{myLat: null, myLng: null, myTagId: null, myTime: null, metrics:null, origin:null},
        views: {
            'tab-createActivity':{
                templateUrl: './templates/addNotif.html',
                controller: 'AddNotifCtrl'
            }
        }

    })

    .state('menu.settings', {
        url: '/setting',
        cache: true,
        params: {},
        views: {
            'tab-createActivity': {
                templateUrl: './templates/setting.html',
                controller: 'SettingCtrl'
            }
        }
    })

    .state('menu.inviteFriend', {
      url: '/inviteFriend',
      cache: true,
      views: {
        'tab-createActivity': {
          templateUrl: './templates/inviteFriend.html',
          controller: 'InviteFriendCtrl'
        }
      }
    })

    .state('menu.reportBug', {
      url: '/reportBug',
      cache: false,
      views: {
        'tab-createActivity': {
          templateUrl: './templates/reportBug.html',
          controller: 'ReportBugCtrl'
        }
      }
    })

    .state('menu.about', {
        url: '/about',
        cache: true,
        params: {},
        views: {
            'tab-createActivity': {
                templateUrl: './templates/about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('menu.marketplace', {
        url: '/marketplace',
        cache: true,
        params: {},
        views: {
            'tab-market': {
                templateUrl: './templates/marketplace.html',
                controller: 'marketplaceCtrl'
            }
        }
    })


    // deckId: used to find the deck to display
    .state('menu.saveActivity', {
        url: '/saveActivityCtrl',
        cache: true,
        params: { deck: null, isBoughtDeck: null },
        views: {
            'tab-createActivity': {
                templateUrl: './templates/saveActivity.html',
                controller: 'saveActivityCtrl'
            }
        }
    })

    .state('menu.playActivity', {
        url: '/playActivity',
        cache: false,
        params: { activity: null },
        views: {
            'tab-playActivity': {
                templateUrl: './templates/playActivity.html',
                controller: 'PlayActivityCtrl'
            }
        }
    })

    .state('menu.completeActivity', {
        url: '/completeActivity',
        cache: false,
        params: { activity: null, currentActivity: null, time: null },
        views: {
            'tab-playActivity': {
                templateUrl: './templates/completeActivity.html',
                controller: 'CompleteActivityCtrl'
            }
        }
    })


    .state('menu.previewActivity', {
        url: '/previewActivity',
        cache: false,
        params: { activity: null },
        views: {
            'tab-playActivity': {
                templateUrl: './templates/previewActivity.html',
                controller: 'PreviewActivityCtrl'
            }
        }
    })

    .state('menu.marketplaceInfoForm', {
        url: '/marketplaceInfoForm',
        cache: false,
        params: {activity: null, isInMarket:null},
        views: {
            'tab-playActivity': {
                templateUrl: './templates/marketplaceInfoForm.html',
                controller: 'MarketplaceInfoFormCtrl'
            }
        }
    })

     .state('menu.markertplaceItem', {
        url: '/MarkertplaceItem',
        cache: false,
        params: { marketItem: null },
        views: {
            'tab-market': {
                templateUrl: './templates/markertplaceItem.html',
                controller: 'MarkertplaceItemCtrl'
            }
        }
    })

  //set the logName
    localStorage.setItem("logName","log_"+Date.now()+".txt");

     if(localStorage.getItem('userdata')!= null){
                console.log('localStorage user exist');

             $urlRouterProvider.otherwise('/menu/CreateActivity');

          //$urlRouterProvider.otherwise('/onBoarding');
          //TODO: commented for now.. it needs more work
        }

        else{
           $urlRouterProvider.otherwise('/onBoarding');

       console.log('localStorage user does not exist');
        };
    // if none of the above states are matched, use this as the fallback
 //   $urlRouterProvider.otherwise('/onBoarding');

    // Contains all the translation for each language
    $translateProvider.translations('en', {
        UTILS: {
            "Title": "Victorise",
            "Tags": "Activity type (running, cycling)",
            "Done-button": "Done",
            "Success": "Success",
            "Yes": "Yes",
            "No": "No",
            "Cancel": "Cancel",
            "Wait": "Please wait",
            "Cards": "Card(s)",
            "Loading": "Please Wait!"
        },
        ONBOARD: {
            "Text-page1": "Track your data (Gps, Time, etc.). Prepare your activity.",
            "Text-page2": "Put your plan in action!",
            "Text-page3": "Share your activity or access Expert Race Plans! in out Marketplace",
            "Skip-button": "Skip",
            "Next-button": "Next"
        },
        LOGIN: {
            "Username": "Username",
            "Password": "Password",
            "Sign-in": "Sign in",
            "Go-offline": "Go offline",
            "Not-reg": "Don't have an account?",
            "Logout": "Logout",
            "Sign-facebook": "Sign in with Facebook",
            "Sign-google": "Sign in with Google+",
            "Sign-twitter": "Sign in with Twitter"
        },
        MYACCOUNT: {
            "My-account": "My account",
            "Decks": "Activities",
            "Decks-sold": "Activities sold",
            "Connect-with": "Connect with",
            "Rate": "Rate This App",
            "Invite": "Invite A Friend",
            "FriendEmail": "Friend's Email Address",
            "FriendEmailButton": "Send Invite",
            "Invite": "Invite A Friend",
            "ReportBug": "Report A Bug",
            "ReportBugButton": "Report Bug"


        },
        SETTINGS:{
            "My-settings":"Settings",
            "Bluetooth": "Bluetooth",
            "My-settings-enter-radius": "Notification Enter Radius",
            "My-settings-exit-radius": "Notification Exit Radius",
            "My-settings-foreground": "Foreground Geoloc Freq",
            "My-settings-background": "Background Geoloc Freq",
            "My-settings-timeoutDuration": "Timeout Duration",
            "My-settings-local-server": "Local Server",
            "My-settings-debug": "Debug Mode",
            "My-settings-ble": "Bluetooth Mode",
            "My-settings-auto-start": "Auto Start",
            "My-settings-auto-pause": "Auto Pause",
            "My-settings-strava": "Publish to Strava",
            "My-settings-user-type": "User Type",
            "My-settings-unit": "Unit"
        },
        ABOUT:{
            "about":"About"
        },
        SAVEACTIVITY: {
          "Save": "Save",
          "Save-info": "INFO",
          "Save-notifs": "TAGS",
          "Optimize-notifs": "Optimize Your Notifications",
          "Create-Notifications": "AutoSplit",
          "Share-strava": "Share on Strava",
          "Sharing-Tile": "SHARING",
          "Strava": "strava"
        },
        MARKET:{
            "market": "Marketplace",
            "My-market": "My Marketplace",
            "My-market-notifications": "Tag",
            "My-market-search-bar": "Search for activities"
        },
        NEWACCOUNT: {
            "New-account": "New account",
            "Creating": "Creating new account",
            "Name": "Name",
            "Email": "Email",
            "Male": "Male",
            "Female": "Female",
            "Age": "Age",
            "Weight": "Weight",
            "Preferred Activity": "Preferred Activity",
            "Account-created": "Your account has been created successfully",
            "Sign-up": "Sign up"
        },
        ACTIVITY: {
            "My-activities": "My activities",
            "Create-activity-title": "Create Activity",
            "Save-activity-title": "Save Activity",
            "Refresh-decks": "Refresh activities",
            "Delete-deck": "Delete activity",
            "Sure-delete-deck": "Are you sure you want to delete this activity?",
            "Create-activity-cancel": "Cancel",
            "My-activities-distance": "Distance:",
            "My-activities-time": "Time:",
            "My-activities-type": "Type:",
            "Info": "INFO",
            "Preview-extra": "EXTRA",
            "Preview-publish": "Publish to Marketplace"
        },
        NOTIFICATIONS: {
          "Notification": "TAG",
          "Notifications": "TAGS",
          "Complete-activity-done": "DONE!",
          "Complete-activity-finish": "FINISH",
          "Complete-activity-info": "INFO",
          "Add-notif": "Enter your Tag text",
          "Discard-notif": "To discard the text Tag delete all the text in the box.",
          "Add-notif-on": "ON",
          "Add-notif-off": "OFF",
          "Text": "Enter Text",
          "Audio": "Choose/Record Audio",
          "Display": "Display in Wearable Device",
          "Split-time": "Split Time",
          "LED-none": "None",
          "LED-red": "Red - 5sec",
          "LED-green": "Green - 5sec",
          "LED-orange": "Oange - blink - 5 sec",
          "LED-blue": "Blue - 5sec",
          "Start": "Starting Point",
          "Finish": "Finishing Point"
        },
        METRICLABEL: {
            "Distance": "DISTANCE",
            "Time": "TIME",
            "Speed": "SPEED",
            "Max-speed": "MAX SPEED",
            "Average-speed": "AVERAGE SPEED",
            "Altitude": "ALTITUDE",
            "ElevationGain": "ELEVATION GAIN",
            "ElevationLoss": "ELEVATION LOSS",
            "Calories": "CALORIES",
            "Power": "EST. POWER OUTPUT",
            "Score": "SCORE"

        },
         HOME: {
            "Home": "Homepage",
            "Bought-decks": "Bought activities",
            "Unseen-cards": "unseen Tag(s)",
            "Add-deck": "Add an activity",
            "Refresh-decks": "Refresh activities",
            "Import-deck": "Import activity",
            "Delete-deck": "Delete activity",
            "Sure-delete-deck": "Are you sure you want to delete this activity?"
        },

        ERROR: {
            "Error": "Error",
            "Error-occurred": "An error occurred while processing your request",
            "Cannot-connect": "Error, please check your username or password",
            "Email-used": "Error, that email address is already used",
            "Error-fields": "Error, please fill all the fields",
            "Email-incorrect": "Error, please enter a correct email address",
            "No-deck-name": "Error, please enter a name for the activity",
            "Cannot-get-deck": "Error, impossible to find the activity",
            "Error-token": "Error, failed to authenticate the token",
            "Error-deck-online": "Error, cannot delete a activity currently available on the store",
            "Error-cannot-sell": "Error, cannot put this activity on the store",
            "Error-cannot-remove": "Error, cannot delete this activity from the store",
            "Cannot-buy-deck": "Error, cannot buy this activity",
            "Version-error" : "Version Error"
        },
        AUDIO: {
        	"Record": "Press to Record Audio",
        	"Type": "Type",
        	"Active": "Active",
        	"Test": "Test Sound",
        	"Testing": "Test me now",
        	"newAudioName": "Save new audio Tag as:"
        }
    });

    // English language by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');
})
// .controller('MainCtrl', ['$state', function($state) {
//   //console.log('HomeTabCtrl');
//   this.onTabSelected = function(_scope){
//     console.log("onTabSelected - main");
//     // if we are selectng the home title then
//     // change the state back to the top state
//     if ( _scope.title === 'create') {
//       setTimeout(function() {
//         $state.go("menu.CreateActivity", {});
//       },20);
//     }
//   }
//   this.onTabDeselected = function(){
//     console.log("onTabDeselected -  main");
//   }
// }])
.directive('hideTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, $el) {
            $rootScope.hideTabs = true;

            // If this attribute is used, hide the tabs
            // scope.$watch(attributes.hideTabs, function(){
            //     $rootScope.hideTabs = true;
            //     console.log(scope.title);
            // });

            // Reset the hideTabs variable when a page is destroyed
            scope.$on('$destroy', function() {

                // Only leave the hideTabs variable for the create page so that the tabs stay hidden
                if(scope.title != "create") {
                    $rootScope.hideTabs = false;
                }
            });
        }
    };
});
