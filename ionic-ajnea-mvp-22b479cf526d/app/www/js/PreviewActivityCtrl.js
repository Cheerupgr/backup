(function () {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('PreviewActivityCtrl', function ($scope, $stateParams, $state, $ionicLoading, $translate, $ionicPopover, $ionicHistory, $ionicSideMenuDelegate, $cordovaFile, $rootScope, MapService, PopupService, ActivityService, UserService, SettingService, UtilitiesService, FileService) {
    UtilitiesService.log("*ENTERPAGE", "PreviewActivity");
    //This is your activity variable whose properties you can manipulate
    var myActivity;
    var userScore = 100;
    var map;
    var allPos = [];

    $scope.substate = 1;
    $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until return to all activities screen)
///////////////////////////////////////////////////////////////////////////////////

    $scope.playActivity = function () {
      $state.go("menu.playActivity", {activity: myActivity});
    };

    $scope.marketInfo = function () {
      UtilitiesService.log("MARKET", 'should go to market info form page now');
      $state.go("menu.marketplaceInfoForm", {activity: myActivity, marketInfoForm: $scope.marketInfoForm});
    };

    $scope.alreadyBought = function () {
      UtilitiesService.log("BUY", 'dummy alreadyBought function');
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    myActivity = $stateParams.activity;
    $scope.activity = myActivity;
    console.dir(myActivity);
    $scope.marketInfoForm = $stateParams.marketInfoForm;
    $scope.isStravaUser = (UserService.getStravaToken() != null) ? true : false;
    UtilitiesService.log("DEBUG", "isStravaUser: " + $scope.isStravaUser);

    var dataLogFilename = myActivity.dataLogFilename;
    // $scope.AllNotifications=Array.from(myActivity.notifications);
    $scope.AllNotifications = Array.from(myActivity.notifications);
    ActivityService.getAllNotifications(myActivity);
    //console.log("AllNotifications:");
    //console.dir($scope.AllNotifications);

    ActivityService.getDataLog(myActivity.dataLogFilename)
      .then(function (theLog) {
        myActivity.dataLog = theLog.dataLog;

        //console.log("myActivity.dataLog: ", myActivity.dataLog);

        console.log("Local Cordova Data Directory:" + cordova.file.dataDirectory);

        console.dir(myActivity);
        $scope.myActivity = myActivity;
        $scope.AllNotifications = Array.from(myActivity.notifications);
        console.dir($scope.AllNotifications);


        // map setup
        for (var i = 0 in myActivity.dataLog) {
          var curLat = myActivity.dataLog[i].lat;
          var curLng = myActivity.dataLog[i].lng;
          var pos = new plugin.google.maps.LatLng(curLat, curLng);
          allPos.push(pos);
        }


        var trackPath = map.addPolyline({
          'points': allPos,
          'color': 'rgba(0, 165, 255, 0.8)',
          'width': 5,
          'geodesic': true
        });

        var latLngBounds = new plugin.google.maps.LatLngBounds(allPos);

        map.moveCamera({
          'target': latLngBounds
        });



        // // Initial start marker
        // MapService.setMarkerType(map, allPos[0], 'start');
        //
        // // Final marker
        // MapService.setMarkerType(map, allPos[allPos.length - 1], 'finish');
        //
        // // Notification markers
        // for (var i = 1; i < myActivity.notifications.length - 1; i++) {
        //   myActivity.notifications[i].metricObject.forEach(function (metric, index, array) {
        //     if (metric.type == "gps") {
        //       var notifPosition =
        //         new plugin.google.maps.LatLng(metric.lat, metric.lng);
        //       //MapService.setMarker(map, notifPosition, MapService.getnotifImg().url);
        //       MapService.setMarkerType(map, notifPosition, 'normal');
        //
        //
        //     }
        //   }, this);
        // }

        //end map setup

        mySettings = SettingService.getSettings();
        UtilitiesService.log("DEBUG", ">unit in localstorage is: " + mySettings.inRad);
        UtilitiesService.log("DEBUG", ">debugMode in localstorage is: " + mySettings.debugMode);
        $scope.debugMode = mySettings.debugMode;
        $scope.unit = mySettings.unit = "metric";


        ///////////////////////////// Enable user to edit activity /////////////////////////////////////////
        $scope.scope = $scope;

        $scope.countNotifType = ActivityService.countNotifType;

        $scope.clearAutoSplit = ActivityService.clearAutoSplit;

        $scope.getIdx = ActivityService.getIdx;

        $scope.createSplitNotification = ActivityService.createSplitNotification;

        $scope.getAllNotifications = ActivityService.getAllNotifications;

        $scope.createNotification = ActivityService.createNotification;

        $scope.deleteNotification = ActivityService.deleteNotification;

        $scope.updateMap = ActivityService.updateMap;

        $scope.updateMap(myActivity, map);

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
        // FOR DEBUG
        $scope.showCurrentActivity = function () {
          console.log("After adding auto-split: ", $scope.myActivity);
        };

        var updateActivitySucess = function (response) {
          UtilitiesService.log("DEBUG", 'addActivitySucess: ' + response);
          $ionicHistory.removeBackView();
          $ionicHistory.clearCache();
          $ionicSideMenuDelegate.canDragContent(true);
          $rootScope.hideTabs = false;
          // $state.go("menu.myActivitiesList", {});
          // myActivity = ActivityService.resetActivity();
        };

        var updateActivityFail = function (response) {
          alert("updateActivityFail");//TODO : ned better UI or message here
          UtilitiesService.log("DEBUG", 'updateActivityFail: ' + response);
          $timeout(UserService.updateActivity(myActivity, updateActivitySucess, updateActivityFail), 3000);
          //TODO : find out
        };

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.toggleMapType = function(){
          MapService.toggleMapType(MapService.getMap("map_canvas_3"));
        };

        $scope.updateActivity = function () {
          $cordovaFile.writeFile(cordova.file.dataDirectory, dataLogFilename, JSON.stringify(myActivity), true)
            .then(function (success) {
              UtilitiesService.log("DEBUG", "writeFile succes" + success);
              FileService.uploadToS3(dataLogFilename, "application/json",
                function () {
                  UtilitiesService.log("DEBUG", "uploadS3 Success");
                  // TODO: if (UserService.isStravaUser)
                  // Deactivated until we xmlf on the server side
                  // UtilitiesService.log("DEBUG", "$scope.isStravaUser" + $scope.isStravaUser );
                  // if ($scope.isStravaUser){
                  //     $scope.shareToStrava();
                  //   }
                },
                function () {
                  UtilitiesService.log("DEBUG", "uploadS3 Fail");
                }
              );

              var currentActivity = angular.copy(myActivity);
              currentActivity.dataLog = [];
              currentActivity.dataLogFilename = dataLogFilename;
              UserService.updateActivity(currentActivity, updateActivitySucess, updateActivityFail);// add activity in the DB
            }, function (error) {
              UtilitiesService.log("DEBUG", "writeFile fail" + error);
              $scope.savingInProgress = false;
              //TODO: investigate why : if not enough space, tell the user
            });
            definePreviousSplit();
          //TODO: send the file to strava (if it's selected) async and independant - try x times until sucess

        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////


        // display units for activity info
        var mySettings = SettingService.getSettings();
        $scope.unit = mySettings.unit;
        $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
        UtilitiesService.log("DEBUG", "---------------------  " + $scope.unit);
        UtilitiesService.log("DEBUG", ">debugMode in localstorage is: " + mySettings.debugMode);
        UtilitiesService.log("Test Unit: " + $scope.unit);


        $scope.goBack = function () {
          $ionicSideMenuDelegate.canDragContent(true);

          $ionicHistory.goBack();
        };

      }), function (error) {
      console.log("Catch all errors: ", error);
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BEFORE ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.beforeEnter', function (scopes, states) {



      $rootScope.side_menu.style.visibility = "hidden";
      $scope.$watch(function () {
          return $ionicSideMenuDelegate.getOpenRatio();
        },
        function (ratio) {
          if (ratio == 1) {
            $rootScope.side_menu.style.visibility = "visible";
          } else {
            $rootScope.side_menu.style.visibility = "hidden";
          }
        });

      map = MapService.getMap("map_canvas_3");
      $scope.map = map;
      map.clear();
      //map.off();
      //map.remove();
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.enter', function (scopes, states) {
      ////////////////       MAP SETUP     ////////////////////////////////////////////////////////////////////////////
      // to hide the side-menu overlap in new map plugin
      //$rootScope.side_menu.style.visibility = "hidden";

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
