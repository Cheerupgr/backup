
(function () {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('saveActivityCtrl', function ($scope, $stateParams, $state, $timeout, $ionicLoading, $ionicSideMenuDelegate, $translate, $ionicPopover, $ionicHistory, $rootScope, $cordovaFile, $ionicPlatform, $cordovaOauth, PopupService, ActivityService, UserService, FileService, UtilitiesService, SettingService, dataLogStorage, MapService) {
    UtilitiesService.log("*ENTERPAGE", "SaveActivity");
    // $ionicSideMenuDelegate.canDragContent(false)

    //This is your activity variable whose properties you can manipulate
    var myActivity;
    var dataLogFilename;
    var userScore = 100;
    var activityName;
    var latestMovingData = {lat: 0, lng: 0, time: 0, altitude: 0, speed: 0};
    var map;
    var allPos;

    $scope.savingInProgress = false;

    // $scope.myActivity.info.averageSpeed = ActivityService.getAverageSpeed($scope.myActivity);
    // $scope.myActivity.info.elevationGain = ActivityService.getElevationGain($scope.myActivity);
    // $scope.myActivity.info.elevationLoss = ActivityService.getElevationLoss($scope.myActivity);
    // $scope.myActivity.info.maxSpeed = ActivityService.getMaxSpeed($scope.myActivity);
    // console.log("$scope.myActivity.info.completedTime: "+$scope.myActivity.info.completedTime); //in ms
    // $scope.myActivity.info.calories = ActivityService.getCaloriesSpent($scope.myActivity.info.completedTime);
    // //TODO: need impementation in ActivityService
    // $scope.myActivity.info.score = ActivityService.getActivityScore($scope.myActivity, $scope.myActivity.info.averageSpeed, $scope.myActivity.info.elevationGain,$scope.myActivity.info.elevationLoss);
    // console.log("SCORE IN:"+$scope.myActivity.info.score);
    // $scope.myActivity.info.power = ActivityService.getAverageEstimatedPowerOutput($scope.myActivity);
    // console.log("power Save:"+$scope.myActivity.info.power);
    // dataLogFilename = UserService.getUserId()+"_"+Date.now()+".json";
    // myActivity.info.dataLogFilename = dataLogFilename;
    //
    //
    // $scope.AllNotifications = ActivityService.getAllNotifications(myActivity);
    $scope.substate = 1;
    $scope.isSelling = false;
    $scope.description = "";
    $scope.price = "";


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS DEFINITION //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function roundDec(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function timeToIso(time) {
      isotime = new Date(time).toISOString();
      return isotime;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function getTrkpt(activity, out) {
      for (var i in activity.dataLog) {
        out += "<trkpt lat=\"" + roundDec(activity.dataLog[i].lat, 7) + "\" lon=\"" + roundDec(activity.dataLog[i].lng, 7) + "\">" +
          "<ele>" + roundDec(activity.dataLog[i].altitude, 1) + "</ele>" + "<time>" + timeToIso(activity.dataLog[i].timestamp) + "</time></trkpt>";
      }
      return out;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function writeGPX(activity) {
      var xmlFile = "";
      xmlFile += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<gpx>" +
        "<metadata> <time>" + timeToIso(activity.dataLog[0].timestamp) + "</time> </metadata>" +
        "<trk>" +
        "<name>" + activity.name + "</name>" +
        "<trkseg>" +
        getTrkpt(activity, xmlFile) +
        "</trkseg>" +
        "</trk>" +
        "</gpx>";
      return xmlFile;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.shareToStrava = function () {
      UtilitiesService.log("SHARE", "> fn Share()" + dataLogStorage);
      activityName = angular.element(document.querySelector('#ActivityName')).val();
      if (activityName != "") {
        myActivity.name = activityName;
      }
      UserService.shareToStrava(UserService.getStravaToken(), dataLogFilename, activityName,
        function (response) {
          UtilitiesService.log("SHARE", "shareToStarva succes" + response);
          console.dir(response);
        },
        function (response) {
          UtilitiesService.log("SHARE", "shareToStrava fail " + response);
        }
      );

    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    addActivitySucess = function (response) {
      UtilitiesService.log("DEBUG", 'addActivitySucess: ' + response);
      $ionicHistory.removeBackView();
      $ionicHistory.clearCache();
      $ionicSideMenuDelegate.canDragContent(true);
      $rootScope.hideTabs = false;
      $state.go("menu.myActivitiesList", {});
      myActivity = ActivityService.resetActivity();
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    addActivityFail = function (response) {
      alert("addActivityFail");//TODO : ned better UI or message here
      UtilitiesService.log("DEBUG", 'addActivityFail: ' + response);
      $timeout(UserService.addActivity(myActivity, addActivitySucess, addActivityFail), 3000);
      //TODO : find out
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    definePreviousSplit = function () {
      var idPreviousSplit = 0;
      myActivity.notifications[0].messageObject[0].splitOrigin = 0;
      myActivity.notifications[0].metricObject[0].interval = 0;
      for (var i = 1; i < myActivity.notifications.length; i++) {

        for (var j = 0; j < myActivity.notifications[i].messageObject.length; j++) {
          if (myActivity.notifications[i].messageObject[j].type == "split"
            || myActivity.notifications[i].messageObject[j].type == "autosplit") {
            myActivity.notifications[i].messageObject[j].splitOrigin = idPreviousSplit;

            myActivity.notifications[i].metricObject[0].interval = myActivity.notifications[i].metricObject[0].timestamp - myActivity.notifications[idPreviousSplit].metricObject[0].timestamp;
            idPreviousSplit = i;
          }
        }
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.saveActivity = function () {
      //prep slit notif
      definePreviousSplit();
      $scope.savingInProgress = true;
      UtilitiesService.log("SAVEACTIVITY", "SaveActivity " + $scope.user);
      // Get the user-defined activity name and set it to activity name if not empty string
      activityName = angular.element(document.querySelector('#ActivityName')).val();
      console.log("This is the name of the activity: ", activityName);
      if (activityName != "") {
        myActivity.name = activityName;
      }
      if (myActivity.authorID == 'undefined' || myActivity.authorID == null || myActivity.authorID == '') {
        myActivity.authorID = UserService.getUser()._id;
        UtilitiesService.log("DEBUG", 'authorID');
        console.dir(UserService.getUser());
      }
      if (myActivity.authorName == 'undefined' || myActivity.authorName == null || myActivity.authorName == '') {
        myActivity.authorName = UserService.getUsername();
        UtilitiesService.log("DEBUG", 'authorName');
      }
      //Setting flag for myActivitiesList to true
      myActivity.isPublished = true;
      console.dir(myActivity);
      // create a updateUserScore in Userservice // Userservice.updateUserScore will call updateUserScore on the server
      UserService.updateUserScore(UserService.getEmail(), userScore);

      $cordovaFile.writeFile(cordova.file.dataDirectory, dataLogFilename, JSON.stringify(myActivity), true)
        .then(function (success) {
          UtilitiesService.log("DEBUG", "writeFile succes" + success);
          FileService.uploadToS3(dataLogFilename, "application/json",
            function () {
              UtilitiesService.log("DEBUG", "uploadS3 Success");
              // TODO: if (UserService.isStravaUser)
              // Deactivated until we xmlf on the server side
              UtilitiesService.log("DEBUG", "$scope.isStravaUser" + $scope.isStravaUser);
              if ($scope.isStravaUser) {
                $scope.shareToStrava();
              }
            },
            function () {
              UtilitiesService.log("DEBUG", "uploadS3 Fail");
            }
          );

          // Remove the currentActivity.txt file from the device after saved
          $cordovaFile.removeFile(cordova.file.dataDirectory, "currentActivity.txt")
          .then(function(success) {
            console.log("File being saved, remove the currentActivity.txt");
          }, function(fail) {
            console.log("Fail to remove currentActivity.txt");
          })

          var currentActivity = angular.copy(myActivity);
          currentActivity.dataLog = [];
          currentActivity.dataLogFilename = dataLogFilename;
          UserService.addActivity(currentActivity, addActivitySucess, addActivityFail);// add activity in the DB
        }, function (error) {
          UtilitiesService.log("DEBUG", "writeFile fail" + error);
          $scope.savingInProgress = false;
          //TODO: investigate why : if not enough space, tell the user
        });

      //TODO: send the file to strava (if it's selected) async and independant - try x times until sucess

    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.removeFinishNotif = function () {
      myActivity.notifications.pop();
      ActivityService.syncActivity(myActivity); //TODO: to investigate
      // console.log($ionicHistory.backView());
      $ionicHistory.goBack();
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // optimizeNotification will call optimizeNotification on the server
    $scope.optimizeNotification = function () {
      UtilitiesService.log("DEBUG", "< notifications");
      UserService.optimizeNotification(UserService.getUserId(), myActivity,
        function (response) {
          UtilitiesService.log("DEBUG", "optimizeNotification succes" + response.data.notification);
          console.dir(response);
        }, function (response) {
          UtilitiesService.log("DEBUG", "optimizeNotification fail");
        }
      );
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.toggleMapType = function(){
      console.log("dsdsdasdasdasd")
      MapService.toggleMapType(MapService.getMap("map_canvas_3"));
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // strava sign in
    $scope.loginStrava = function () {
      $ionicPlatform.ready(function () {
        // Display a loading screen
        //response_type:code, redirect_uri:'http://localhost', approval_prompt:force
        $ionicLoading.show({template: $translate.instant('LOGIN.Sign-in') + ' ...'});
        $cordovaOauth.strava('14462', '31dfaef16011313f7eb571ab43314a539a68eab4', ['write']).then(
          function (result) {
            // Success
            UtilitiesService.log("DEBUG", "$cordovaOauth.strava success");

            var data = JSON.stringify(result);

            console.log("data " + data);
            UserService.connectwithStrava(data, function (response) {
              // Success
              // Hide the loading screen
              $ionicLoading.hide();

              //$scope.isStravaUser = (UserService.getStravaToken() != null)? true : false;
              console.log("sucess strava link " + UserService.getStravaToken());
              $scope.isStravaUser = true;
              UtilitiesService.log("DEBUG", "UserService.getStravaToken(): " + UserService.getStravaToken());
              //PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
            }, function (response) {
              // Fail
              // Hide the loading screen
              $ionicLoading.hide();
              //todo: better message here
              PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
            });

          }, function (error) {
            // Fail
            // Hide the loading screen
            UtilitiesService.log("DEBUG", "$cordovaOauth.strava fail");
            $ionicLoading.hide();
            PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant("$cordovaOauth.strava fail"));
          });
      });
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.SaveSettings = function () {
      UtilitiesService.log("DEBUG", "$scope.mySettings.autoShareToStrava " + $scope.mySettings.autoShareToStrava);
      UtilitiesService.log("DEBUG", "SettingService.getSettings " + SettingService.getSettings());
      SettingService.localsave($scope.mySettings);
      // PopupService.showAlert("Settings", "Settings saved successfully!");
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // THIS ONLY RUN ONCE   //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.isStravaUser = (UserService.getStravaToken() != null) ? true : false;
    $scope.mySettings = SettingService.getSettings();
    //$scope.autoShareToStrava = mySettings.autoShareToStrava;

    // units
    $scope.unit = $scope.mySettings.unit;
    $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
    UtilitiesService.log("DEBUG", "isStravaUser: " + $scope.isStravaUser);
    UtilitiesService.log("DEBUG", "---------------------  " + $scope.unit);
    UtilitiesService.log("DEBUG", ">debugMode in localstorage is: " + $scope.mySettings.debugMode);

    //Checking to see if the Activity Object has been initialized,  if not then it creates a new one otherwise just get reference to global object in use.
    if (typeof ActivityService.importActivity() == 'undefined') {
      UtilitiesService.log("SAVEACTIVITY", 'inside if');
      myActivity = ActivityService.newActivity();
    }
    else {
      myActivity = ActivityService.importActivity();
      UtilitiesService.log("SAVEACTIVITY", JSON.stringify(myActivity.name));
      // var myLat = myActivity.dataLog[myActivity.dataLog.length - 1].lat;
      // var myLng = myActivity.dataLog[myActivity.dataLog.length - 1].lng;
      // var myTime = myActivity.dataLog[myActivity.dataLog.length - 1].time;
      // var mySpeed = myActivity.dataLog[myActivity.dataLog.length - 1].speed;
      // var myAltitude = myActivity.dataLog[myActivity.dataLog.length - 1].altitude;
      latestMovingData = ActivityService.findLatestMovingData(myActivity.dataLog);

      myActivity.notifications.push(
        {
          metricObject: [{
            type: 'gps',
            lat: latestMovingData.lat,
            lng: latestMovingData.lng,
            time: (latestMovingData.timestamp - myActivity.notifications[0].metricObject[0].timestamp ),
            timestamp: latestMovingData.timestamp,
            altitude: latestMovingData.altitude,
            speed: latestMovingData.speed
          }],
          messageObject: [{type: 'split', name: 'NOTIFICATIONS.Finish', message: 'NOTIFICATIONS.Finish'}]
        });
      // Final marker

    }//end of myactivity else

    allPos = MapService.getPositions(myActivity);
    console.dir(myActivity);
    $scope.myActivity = myActivity;
    $scope.myActivity.info.averageSpeed = ActivityService.getAverageSpeed($scope.myActivity);
    $scope.myActivity.info.elevationGain = ActivityService.getElevationGain($scope.myActivity);
    $scope.myActivity.info.elevationLoss = ActivityService.getElevationLoss($scope.myActivity);
    $scope.myActivity.info.maxSpeed = ActivityService.getMaxSpeed($scope.myActivity);
    console.log("$scope.myActivity.info.completedTime: " + $scope.myActivity.info.completedTime); //in ms
    $scope.myActivity.info.calories = ActivityService.getCaloriesSpent($scope.myActivity.info.completedTime);
    //TODO: need impementation in ActivityService
    $scope.myActivity.info.score = ActivityService.getActivityScore($scope.myActivity, $scope.myActivity.info.averageSpeed, $scope.myActivity.info.elevationGain, $scope.myActivity.info.elevationLoss);
    $scope.myActivity.info.power = ActivityService.getAverageEstimatedPowerOutput($scope.myActivity);
    dataLogFilename = UserService.getUserId() + "_" + Date.now() + ".json";
    myActivity.info.dataLogFilename = dataLogFilename;
    $scope.AllNotifications = ActivityService.getAllNotifications(myActivity);


    //TODO: get user age
    UtilitiesService.log("DEBUG", "gender: " + UserService.getGender());
    userScore = UserService.getUserScore(30, UserService.getGender(), UserService.getUserVO2($scope.myActivity.info.averageSpeed));
    UtilitiesService.log("DEBUG", "userScore: " + userScore);

    //todo: move this 3 following fn in Activity Service (done)
    // Added the functions to the $scope object so that the function is accessable to the view.

    // Since we moved the createNotification to Services.js,
    // we need to pass $scope in the function to reset $scope.AllNotifications.
    // Don't know if there is a better way to do so... but here is what I got setting $scope.scope = $scope
    $scope.scope = $scope;

    $scope.countNotifType = ActivityService.countNotifType;

    $scope.clearAutoSplit = ActivityService.clearAutoSplit;

    $scope.getIdx = ActivityService.getIdx;

    $scope.createSplitNotification = ActivityService.createSplitNotification;

    $scope.getAllNotifications = ActivityService.getAllNotifications;

    $scope.createNotification = ActivityService.createNotification;

    $scope.deleteNotification = ActivityService.deleteNotification;


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.enter', function (scopes, states) {

      UtilitiesService.log("*ENTERPAGE", 'SaveActivity >> $ionicView.enter' + states.fromCache + " - " + states.stateName);

      $scope.myActivity = ActivityService.importActivity();

      ////////////////////// MAP SETUP //////////////////////////////////////////////////////////////////////////////////
      map = MapService.getMap("map_canvas_2");
      $scope.map = map;
      var latLngBounds = new plugin.google.maps.LatLngBounds(allPos);

      map.animateCamera({
        'target': latLngBounds,
        'duration': 1000,
      });

      // Clear map and update
      
      $scope.updateMap = ActivityService.updateMap;

      $scope.updateMap(myActivity, map);

      // Initial start marker

      //MapService.setMarker(map, allPos[0], MapService.getstartImg().url);
      MapService.setMarkerType(map, allPos[0], 'start');

      // Final marker
      var finishPosition =
        new plugin.google.maps.LatLng(latestMovingData.lat, latestMovingData.lng);
      //new google.maps.LatLng(latestMovingData.lat, latestMovingData.lng);
      MapService.setMarker(map, finishPosition, MapService.getfinishImg().url);
      MapService.setMarkerType(map, finishPosition, 'finish');

      // Notification markers
      for (var i = 1; i < myActivity.notifications.length - 1; i++) {
        myActivity.notifications[i].metricObject.forEach(function (metric, index, array) {
          if (metric.type == "gps") {
            var notifPosition =
              //new google.maps.LatLng(metric.lat, metric.lng);
              new plugin.google.maps.LatLng(metric.lat, metric.lng);
            //MapService.setMarker(map, notifPosition, MapService.getnotifImg().url);
            MapService.setMarkerType(map, notifPosition, 'normal');
          }
        }, this);
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON LEAVE //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.leave', function () {
      map.clear();
      map.off();
      map.remove();
    });

  });

})();
