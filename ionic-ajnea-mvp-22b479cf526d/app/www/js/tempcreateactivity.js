(function () {

  angular
    .module('controllers')
    .controller('CreateActivityCtrl', CreateActivityCtrl)

  function CreateActivityCtrl($scope, $state, $stateParams, $ionicHistory, $ionicLoading, $rootScope, $translate, $timeout, AudioServices, UserService, PopupService, ActivityService, BLE, UtilitiesService, SettingService, $ionicSideMenuDelegate) {

    UtilitiesService.log("*ENTERPAGE", "CreateActivity");
    UtilitiesService.log("PLATFORM", ionic.Platform.platform());

    //This is your activity variable whose properties you can manipulate
    var myActivity;
    var hardStop = false ; // when the user presses the stopbutton instead of the autoreusme feature
    var isclockStartRequest; //?
    var storage = window.localStorage;
    var data = [];
    var dataCoords = [];
    var offset;
    var tracking = false;
    var started = false;
    var map;
    var prevSecond = 0; // used in measuredistance
    var notificationState = false;
    var start_marker;
    var trackPath;
    var measurement = 0;
    var myMetricDiv = document.getElementById('metric_container');
    var elevationGain = 0; // use for local calculation
    var elevationLoss = 0; // use for local calculation
    var elevation = 0; // use for local calculation
    var watchProcess = null;
    var myElement = angular.element(document.querySelector('#stop_tracking_button'));
    var myElement2 = angular.element(document.querySelector('#tag_button'));

    $scope.currentMetric = {
      coords: 0,
      time: 0,
      lat: 0,
      lng: 0,
      altitude: 0,
      accuracy: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0,
      timestamp: 0,
      power: 0
    };

    //$scope.debugMode = true;
    $scope.isMoving = "NONE";
    $scope.metricDisplay = 1;
    $scope.maxspeed = 0;
    $scope.averagespeed = 0;
    //$scope.startFlag = false;

    $scope.clock = -1;
    $scope.geolocFreq = parseInt(storage.getItem("fg-freq"));
    $scope.timeSpent = 0;
    $scope.distance = 0.0;
    $scope.substate = 1;
    $scope.devices = BLE.devices;
    $scope.myConnectedDevice = null;
    $scope.BLEisConnected = false;

    //Init Display values
    $scope.displayClock = "00:00:00";
    $scope.displaySpeed = "--";
    $scope.displayMaxspeed = "--";
    $scope.displayAveragespeed = "--";
    $scope.displayAltitude = "--";
    $scope.displayAccuracy = "--";
    $scope.displayDataLogLength = "--";
    $scope.displayDistance = "--";
    $scope.displayPower = "--";
    $scope.displayElevationLoss = "--";
    $scope.displayElevationGain = "--";



    var mySettings = SettingService.getSettings();
    $scope.unit = mySettings.unit;
    $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
    UtilitiesService.log("DEBUG", "---------------------  " + $scope.unit);

    //This is your activity variable whose properties you can manipulate

    //Checking to see if the Activity Object has been initialized,  if not then it creates a new one otherwise just get reference to global object in use.
    if (typeof ActivityService.importActivity() == 'undefined') {
      myActivity = ActivityService.newActivity();
    }
    else {
      myActivity = ActivityService.importActivity();
    }//end of myactivity else

    // I DOnt Think it's correct// $scope.myActivity = null;

    //Checking to see if the Activity Object has been initialized,  if not then it creates a new one otherwise just get reference to global object in use.
    if (typeof ActivityService.importActivity() == 'undefined') {
      $scope.myActivity = ActivityService.newActivity();
    }
    else {
      $scope.myActivity = ActivityService.importActivity();
    }

    UtilitiesService.enableBgMode();

    ////////////////   UTIL    ////////////////////////

    Number.prototype.toFixedDown = function (digits) {
      var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
      return m ? parseFloat(m[1]) : this.valueOf();
    };

    //////////////// USER CONNECTION MANAGEMENT ////////////////////////

    if (localStorage.getItem('userdata') != null) {
      var userdata = localStorage.getItem('userdata');
      UserService.connect(JSON.parse(userdata), function (response) {
        // Success
        userConnected();
      }, function (response) {
        // Fail
        userNotConnected(response);
      });
    }

    function userConnected() {
      // Make the next page the root history
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $ionicLoading.hide();
    }

    function userNotConnected(response) {
      // Hide the loading screen
      $ionicLoading.hide();
      // Display a popup
      if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
        PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
      else
        PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
    }

    //////////////////////////////////////////////////////////////

    ////////////////       MAP SETUP     ////////////////////////
    var myOptions = SettingService.getMapOptions();
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    var posIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 4,
      fillColor: "white",
      fillOpacity: 0.8,
      strokeWeight: 1,
      rotation: 90 //this is how to rotate the pointer
    };
    var styles = SettingService.getMapStyles();
    map.setOptions({styles: styles});

    if ($stateParams.reload == true) {
      UtilitiesService.log("DEBUG", map);
    }
    //////////////////////////////////////////////////////////////


    $scope.backState = function () {
      hardStop = true;
      UtilitiesService.log("ACTION", '>backState()');
      $rootScope.hideTabs = false; // Reset so tabs come back
      //$scope.$apply();
      // Reset all local variables
      isclockStartRequest;
      storage = window.localStorage;
      data = [];
      dataCoords = [];
      offset;
      tracking = false;
      started = false;
      prevSecond = 0;
      notificationState = false;
      start_marker;
      trackPath;
      storage = window.localStorage;
      elevationGain = 0;
      elevationLoss = 0;

      // Reset all scope variables
      $scope.currentMetric = {
        coords: 0,
        time: 0,
        lat: 0,
        lng: 0,
        altitude: 0,
        accuracy: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
        timestamp: 0,
        power: 0,
        is_moving: false,
        activityType: "",
        activityTypeConfidence: 0
      };

      $scope.debugMode = false;
      $scope.metricDisplay = 1;
      $scope.maxspeed = 0;
      $scope.averagespeed = 0;

      $scope.clock = -1;
      $scope.geolocFreq = parseInt(storage.getItem("fg-freq"));
      $scope.timeSpent = 0;
      $scope.distance = 0.0;
      $scope.substate = 1;
      $scope.devices = BLE.devices;
      $scope.myConnectedDevice = null;

      //Init Display values
      $scope.displayClock = "00:00:00";
      $scope.displaySpeed = "--";
      $scope.displayMaxspeed = "--";
      $scope.displayAveragespeed = -"--";
      $scope.displayAltitude = "--";
      $scope.displayAccuracy = "--";
      $scope.displayDataLogLength = "--";
      $scope.displayDistance = "--";
      $scope.displayPower = "--";
      $scope.displayElevationLoss = "--";
      $scope.displayElevationGain = "--";

      // Create a new map to replace the line and markers from the last one
      $scope.substate = 1;
      myMetricDiv.style.height = "250px";
      //$scope.$apply();
      // $state.go($state.current, {reload: true}, {reload: true});

      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      map.setOptions({styles: styles});
    };

    /// BLE AUTOCONNECT /////////////////////////////////////
    var testAutoconnect = 1;
    $scope.BLEautoConnect = function () {
      UtilitiesService.log("BLECONNECT", ">BLEautoConnect()");
      var mybledevice = window.localStorage.getItem("LatestBLEDeviceID");
      UtilitiesService.log("BLECONNECT", " getting bledevice");
      if (typeof ble != 'undefined' && mybledevice != null) {
        ble.startScan([],
          function (device) {
            //console.log(JSON.stringify(device));
            //for (i = 0; i < device.length; i++) {
            UtilitiesService.log("DEBUG", device.id + " compare to" + mybledevice);
            if (device.id.toString() == mybledevice.toString()) {
              UtilitiesService.log("DEBUG", ">>success compare");
              myConnectedDevice = device;
              BLE.connect(myConnectedDevice.id).then(function () {
                UtilitiesService.log("DEBUG", "> $scope.BLE.connect()");
                console.dir(myConnectedDevice);
                window.localStorage.setItem("LatestBLEDevice",
                  myConnectedDevice);
                window.localStorage.setItem("LatestBLEDeviceID", myConnectedDevice.id);
                UtilitiesService.log("DEBUG", "LatestBLEDevice: " + myConnectedDevice.id);
                console.dir(myConnectedDevice);
                //add check mark to device ??
                var arrayBuffer = BLE.getNotificationBLE(myConnectedDevice.id);
                $scope.messageReceived = $scope.bytesToString(arrayBuffer);
                myConnectedDevice.isConnected = true;
                $scope.BLEisConnected = true;
                return;
              });
              // }
            }
          },
          function () {
            UtilitiesService.log("BLECONNECT", "error scan");
          }
        );
      }
      if ($scope.BLEisConnected == false && testAutoconnect < 5) {
        $timeout($scope.BLEautoConnect, testAutoconnect * 1000);
        UtilitiesService.log("DEBUG", "test BLEautoConnect number " + testAutoconnect);
        testAutoconnect++;
      }
    };
    $scope.BLEautoConnect();
    ////////////////////////////////////////////////////////

    // $scope.goToActivitiesList = function () {
    //     UtilitiesService.log("ACTIVITYLIST", '>goToActivitiesList()');
    //     navigator.geolocation.clearWatch(watchProcess);
    //     //if ($scope.bgLocationServices != undefined) $scope.bgLocationServices.stop();
    //     if (bgGeo != undefined)bgGeo.stop();
    //     $state.go("menu.myActivitiesList");
    // };

    $scope.changeNotification = function () {
      UtilitiesService.log("DEBUG", '>changeNotification()');
      notification_name = document.getElementById("notification_name_").value;
    };

    $scope.updateTrackData = function () {
      $scope.currentMetric.time = $scope.clock; //force to update the time
      data.push($scope.currentMetric);
      dataCoords.push(data[data.length - 1].coords);
    };

    $scope.updateHTML = function () {
      if ($scope.clock != null) $scope.displayClock = UtilitiesService.convertTimeHMS($scope.clock, 3);
      if ($scope.currentMetric.speed != null) $scope.displaySpeed = $scope.currentMetric.speed.toFixed(2);
      // if($scope.currentMetric.maxspeed!=null)
      $scope.displayMaxspeed = $scope.maxspeed.toFixed(2);
      $scope.displayAveragespeed = $scope.distance / ($scope.timeSpent / 1000);//Note: timeSpent is in Ms
      //if ($scope.currentMetric.altitude != null) $scope.displayAltitude = $scope.currentMetric.altitude.toFixed(2) + "m +/- " + $scope.currentMetric.altitudeAccuracy;
      if ($scope.currentMetric.accuracy != null) $scope.displayAccuracy = $scope.currentMetric.accuracy;
      if (data.length != null) $scope.displayDataLogLength = data.length;
      if ($scope.distance != null)  $scope.displayDistance = $scope.distance.toFixed(2);
      $scope.is_moving = $scope.currentMetric.is_moving;
      $scope.activityType = $scope.currentMetric.activityType;
      $scope.activityTypeConfidence = $scope.currentMetric.activityTypeConfidence;
      if ($scope.currentMetric.power != null && $scope.currentMetric.power > 0)  $scope.displayPower = $scope.currentMetric.power.toFixed(1);
      $scope.displayElevationLoss = elevationGain;
      $scope.displayElevationGain = elevationLoss;

    };

    $scope.loop = function () {
      UtilitiesService.log("DEBUG","hardStop: "+hardStop);
      if (tracking == true) {
        if ($scope.substate == 2) {
          //	time_1=time_1+ 0.01;
          var now = Date.now();
          $scope.clock += (now - offset);
          offset = now;
          $scope.timeSpent = $scope.clock;
          $scope.updateHTML();
          //autoPause
          // if ($scope.currentMetric.speed <.4 || mySettings.autoPauseMode == false) //.4m/s is 1.44km/k or 1ms is 3.6km/h
          // {
          //   stopTracking();
          // } else {
          //   if ( tracking ==false && hardStop == false) //startTracking();
          // }
          //
          $timeout($scope.loop, 500);// instead of setTimeout , it's more angular friendly
        }
      } else {
        return;
      }
    };

    $scope.goToTracking = function () {
      UtilitiesService.log("DEBUG", 'inside goToTracking() method');
      //Checking to see if the Activity Object has been initialized,  if not then it creates a new one otherwise just get reference to global object in use.
      if (typeof ActivityService.importActivity() == 'undefined') {
        $scope.myActivity = ActivityService.newActivity();
      } else {
        $scope.myActivity = ActivityService.importActivity();
      }
      $scope.clock = 0;
      offset = Date.now();
      $scope.substate = 2;
      $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until activity has been saved)
      $rootScope.hideTabs = true;
      tracking = true;
      $scope.updateTrackData();

      if (data.length == 1) {
        setStartingMarker();
        $scope.myActivity.notifications.push({
          metricObject: [{
            type: 'gps',
            lat: data[0].coords.lat(),
            lng: data[0].coords.lng(),
            time: data[0].time,
            altitude: data[0].altitude
          }],
          messageObject: [{type: 'text', message: 'NOTIFICATIONS.Start'}]
        });
      }
      if (tracking == true) {
        $scope.loop();
      } else {
        return;
      }
    };


    setStartingMarker = function () {
      var image =
      {
        url: 'img/markerlabel_start.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(28, 38),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(14, 38)
      };
      start_marker = new google.maps.Marker(
        {
          position: data[0].coords,
          map: map,
          size: new google.maps.Size(10, 10),
          icon: image
        });
    };

    setTrackPath = function () {
      trackPath = new google.maps.Polyline({
        path: dataCoords,
        strokeColor: "#FFA500",
        strokeOpacity: 0.8,
        strokeWeight: 5
      });
      trackPath.setMap(map);
    };

    $scope.requestTracking = function ()
    {
      UtilitiesService.log("DEBUG", ">autoPauseMode: " + mySettings.autoPauseMode);
      UtilitiesService.log("DEBUG", ">autoStartMode  " + mySettings.autoStartMode);

      $scope.substate = 2; // make it's enough to show buttons in pause mode

      if ($scope.currentMetric.speed >.4 || mySettings.autoStartMode == false) //.4m/s is 1.44km/k or 1ms is 3.6km/h
      {
        UtilitiesService.log("DEBUG","requestTracking: GO" );
        startTracking();
        hardStop = false;
      }else {
        $timeout($scope.requestTracking,500);
      }
    };

    function measure_distance() {
      //k=k+0.00001;  //if you want check on real time just comment this line
      if (tracking == true) {
        if ($scope.substate == 2) {
          if (prevSecond != Math.round($scope.seconds)) {
            prevSecond = Math.round($scope.seconds);
            if (data.length > 1) {
              if (data[data.length - 1] != data[data.length - 2]) {
                measurement = google.maps.geometry.spherical.computeDistanceBetween(dataCoords[data.length - 1], dataCoords[data.length - 2]);
                if (measurement > 0 && measurement != null && (isNaN(measurement) != true)) {
                  $scope.distance += measurement;
                }
              }
            }
          }
        }
      } else {
        return;
      }
    };


    if (watchProcess == null) {
      watchProcess = navigator.geolocation.watchPosition(handle_geolocation_query, handle_errors, {
        frequency: 250,
        enableHighAccuracy: true,
        maximumAge: 0//Infinity
      });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    function handle_errors(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("user did not share geolocation data");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("could not detect current position");
          break;
        case error.TIMEOUT:
          alert("retrieving position timedout");
          break;
        default:
          alert("unknown error");
          break;
      }
    }

    ////////////handle_geolocation_query/////////////////////////////////////////////////////////////////////////
    function handle_geolocation_query(position) {
      $ionicLoading.hide();
      currPosLatLng = new google.maps.LatLng({lat: position.coords.latitude, lng: position.coords.longitude});
      $scope.currentMetric = {
        coords: currPosLatLng,
        time: $scope.clock,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        is_moving: position.is_moving,
        power: ActivityService.getEstimatedPowerOutput(data)
        //activityType : position.activity.type
        //activityTypeConfidence : position.activity.confidence
      };
      //console.dir($scope.currentMetric);
      //console.log($scope.currentMetric.is_moving);
      if ($scope.currentMetric.is_moving != 'undefined') {
        if ($scope.currentMetric.is_moving == false && tracking == true) {
          stopTracking();
        }
        if ($scope.currentMetric.is_moving == true && tracking == false) {
          startTracking();
        }
      }

      //Calculate elevationGain and elevationLoss
      if (typeof $scope.currentMetric.altitude != 'undefined' || $scope.currentMetric.altitude != null) {
        if ($scope.currentMetric.altitude > elevation) {
          elevationGain = +$scope.currentMetric.altitude - elevation;
        } else {
          elevationLoss = +elevation - $scope.currentMetric.altitude;
        }
        elevation = $scope.currentMetric.altitude;
      }

      //Calculate maxspeed
      if ($scope.currentMetric.speed > $scope.maxspeed) {$scope.maxspeed = $scope.currentMetric.speed;}

      if (!started) {
        posMarker = new google.maps.Marker({
          position: currPosLatLng,
          map: map,
          size: new google.maps.Size(10, 10),
          icon: posIcon
        });
        started = true
      }

      posMarker.setPosition(currPosLatLng);
      posMarker.icon = posIcon;

      if (tracking == true)
      {
        // if (started) {
        //   posMarker.setPosition(currPosLatLng);
        //   posMarker.icon = posIcon;
        //     }
        $scope.updateTrackData();
        measure_distance();
        setTrackPath();
      }
      var cent = currPosLatLng;
      map.panTo(cent);
    } // end handle_geolocation_query

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    stopTracking = function () {
      UtilitiesService.log("zeDEBUG","stopTracking: "+ $scope.currentMetric.speed );
      tracking = false;
      myElement[0].src = "img/btn_resume.png";
      myElement2[0].src = "img/btn_finish.png";
    };

    startTracking = function () {
      UtilitiesService.log(ze"DEBUG","startTracking: "+ $scope.currentMetric.speed );
      // if ($scope.currentMetric.speed >.4) //.4m/s is 1.44km/k or 1ms is 3.6km/h
      // {
      myElement[0].src = "img/btn_stop.png";
      myElement2[0].src = "img/btn_tag.png";
      notificationState = false;
      offset = Date.now();
      $scope.goToTracking();
      // }else{
      //   $timeout(startTracking, 1000); // try again in 1000ms
      // }
    };

    $scope.toggle_tracking = function () {
    $scope.toggle_tracking = function () {
      UtilitiesService.log("ACTION", '>toggle_tracking() ' + tracking);
      if (tracking) {
        hardStop = true;
        stopTracking();
      } else if (!tracking) {
        startTracking();
        hardStop = false;
      }
    };


    $scope.tag = function () {
      UtilitiesService.log("CREATEACTIVITY", tracking)
      UtilitiesService.log("DEBUG", 'inside tag() with tracking: ' + tracking);
      if (tracking || (!tracking && notificationState)) {
        tracking = false;
        notificationState = true;

        //mark the notification position on the map
        var notifImg = {
          url: 'img/gps_marker.png',
          scaledSize: new google.maps.Size(28, 38),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(14, 38)
        };
        var notMarker = new google.maps.Marker({
          position: currPosLatLng,
          map: map,
          size: new google.maps.Size(10, 10),
          icon: notifImg
        });

        $state.go("menu.addNotification", {
          myLat: currPosLatLng.lat(),
          myLng: currPosLatLng.lng(),
          metrics: $scope.currentMetric,
          myTagId: data.length - 1,
          myTime: $scope.clock
        });
        //tracking = true;

      }
      else if (!tracking) {
        UtilitiesService.log("CREATEACTIVITY", "finish");
        $scope.finish();
      }
    };

    $scope.togglemetricDisplay = function () {
      if ($scope.metricDisplay == 1) {
        $scope.metricDisplay = 2;
        // myMapDiv.style.bottom = "300px";
        myMetricDiv.style.height = "410px";

      } else {

        //myMapDiv.style.bottom=  "230";
        myMetricDiv.style.height = "250px";
        $scope.metricDisplay = 1;
      }
    };

    $scope.finish = function () {
      UtilitiesService.log("CREATEACTIVITY", "inside of finish()");
      navigator.geolocation.clearWatch(watchProcess);
      // debugger;

      //if ($scope.bgLocationServices != undefined)$scope.bgLocationServices.stop();

      // var myNumNotifications;
      //
      // if ($scope.myActivity.notifications == null) {
      //   myNumNotifications = 0;
      // } else {
      //   myNumNotifications = $scope.myActivity.notifications.length + 1;
      // }

      //Setting the activity's author
      //$scope.myActivity.authorID = UserService.getEmail();

      //Setting the general info that each activity has, i.e. (Time, distance, number of notifications)
      $scope.myActivity.info = {distance: $scope.distance.toFixedDown(2), completedTime: $scope.timeSpent};

      console.dir(data);
      // i scale down the dataLog to 800ish entry to make sure it uploads
      $scope.myActivity.dataLog = UtilitiesService.scaleDataLog(data, 800);

      $ionicHistory.nextViewOptions({
        disableBack: false
      });

      $state.go("menu.saveActivity", {deck: myActivity, isBoughtDeck: false});
    };


    restart = function () {
      UtilitiesService.log("CREATEACTIVITY", "-- is$scope.clockStarted is true");
      set
      notificationState = true;
      $scope.substate = 1;
      $scope.goToTracking();
    };


    var tagListener = $scope.$on('GetNotifEvent', function (event, data) {
      UtilitiesService.log("DEBUG", ">GetNotifEvent()");
      if (data.value == "TAG") {
        if ($scope.substate == 1) {
          $scope.goToTracking();
          $scope.$apply();
          BLE.sendData(myConnectedDevice.id, "111001000");
          AudioServices.play("start", "mp3", true);
        } else {

          $scope.myActivity.notifications.push({
            metricObject: [{
              type: 'gps',
              lat: currPosLatLng.lat(),
              lng: currPosLatLng.lng(),
              time: $scope.clock
            }],
            messageObject: [{type: 'split', id: '1', message: 'Auto BLE Notification'}]
          });
          if (typeof myConnectedDevice != 'undefined') {
            BLE.sendData(myConnectedDevice.id, "141001000");
          }
          AudioServices.play("createnotif", "mp3", true);
        }
      }

    });

    // $scope.$on('$ionicView.leave', function () {
    //   tagListener(); // remove listener
    // });

    $ionicLoading.show({template: $translate.instant('UTILS.Loading') + ' ...'});

    $scope.$on('$ionicView.enter', function () {
      // code to run each time view is entered
      mySettings = SettingService.getSettings();
      UtilitiesService.log("DEBUG", '>>$ionicView.enter');
      $scope.debugMode = mySettings.debugMode;
      isclockStartRequest = $rootScope.isClockStartRequest;
      if (isclockStartRequest == true) {
        $rootScope.isClockStartRequest = false;
        $scope.toggle_tracking();
      }
      $scope.$apply();
    });

    // $scope.nbData = 999;
    $scope.addData = function (val) {
      UtilitiesService.log("DEBUG", "addData " + val);
      for (i = 0; i < val; i++) {
        data.push($scope.currentMetric);
      }
    };

    $scope.printData = function () {
      UtilitiesService.log("DEBUG", ">printData()");
      console.dir(data);
    };

    document.addEventListener('deviceready', function () {
      // Get a reference to the plugin.
      var bgGeo = window.BackgroundGeolocation;

      //This callback will be executed every time a geolocation is recorded in the background.
      var callbackFn = function (location, taskId) {
        //console.log('- Location: ', JSON.stringify(location));
        handle_geolocation_query(location);
        // Must signal completion of your callbackFn.
        bgGeo.finish(taskId);
      };

      // This callback will be executed if a location-error occurs.  Eg: this will be called if user disables location-services.
      var failureFn = function (errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
      };

      // Listen to location events & errors.
      bgGeo.on('location', callbackFn, failureFn);

      // Fired whenever state changes from moving->stationary or vice-versa.
      bgGeo.on('motionchange', function (isMoving) {
        console.log('- onMotionChange: ', isMoving);
        $scope.isMoving = isMoving;
      });

      // BackgroundGeoLocation is highly configurable.
      bgGeo.configure(SettingService.getbgLocationSettings(), function (state) {
        // This callback is executed when the plugin is ready to use.
        UtilitiesService.log("ACTIVITY", 'BackgroundGeolocation ready: ', state);
        if (!state.enabled) {
          bgGeo.start();
        }
      });

      bgGeo.start();

      // bgGeo.onActivityChange(function (activityName) {
      //     UtilitiesService.log("DEBUG", '- Activity changed: ', activityName);
      //     console,log('- Activity changed: ', activityName);
      //     if (activityName == "still") {
      //         document.addEventListener('deviceready', function () {
      //             TTS.speak("pause", function () {
      //             }, function (reason) {
      //             });
      //         });
      //     } else {
      //         document.addEventListener('deviceready', function () {
      //             TTS.speak("resume", function () {
      //             }, function (reason) {
      //             });
      //         });
      //     }
      // });

    });


  };

  CreateActivityCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicHistory', '$ionicLoading', '$rootScope', '$translate', '$timeout', 'AudioServices', 'UserService', 'PopupService', 'ActivityService', 'BLE', 'UtilitiesService', 'SettingService', '$ionicSideMenuDelegate']

}());
