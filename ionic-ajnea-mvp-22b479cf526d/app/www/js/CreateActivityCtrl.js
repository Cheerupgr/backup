(function () {

  angular
    .module('controllers')
    .controller('CreateActivityCtrl', CreateActivityCtrl)


  function CreateActivityCtrl($scope, $state, $stateParams, $ionicHistory, $ionicLoading, $cordovaFile, $rootScope, $translate, $timeout, AudioServices, UserService, PopupService, ActivityService, BLE, UtilitiesService, SettingService, MapService, $ionicSideMenuDelegate, GPSService) {

    UtilitiesService.log("*ENTERPAGE", 'CreateActivity');
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // VARIABLES DEFINITION //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var initCount = 0 ;
    var myActivity;
    var isclockStartRequest; //?
    var storage = window.localStorage;
    var data = [];
    var dataCoords = [];
    var offset = 0;
    var pausedTime = 0;
    var pauseStartTime = 0;
    var tracking = false;
    var started = false;
    var map;
    var prevSecond = 0; // used in measuredistance
    var notificationState = false;
    var trackPath;
    var measurement = 0;
    var myMetricDiv = document.getElementById('metric_container');
    var elevationGain = 0; // use for local calculation
    var elevationLoss = 0; // use for local calculation
    var elevation = 0; // use for local calculation
    var myElement = angular.element(document.querySelector('#stop_tracking_button'));
    var myElement2 = angular.element(document.querySelector('#tag_button'));
    var now = Date.now();
    var testAutoconnect = 1;
    var tagListener;
    var startMarker = null;

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
    $scope.metricDisplay = 1;
    $scope.maxspeed = 0;
    $scope.averagespeed = 0;
    $scope.clock = 0;
    $scope.geolocFreq = parseInt(storage.getItem("fg-freq"));
    $scope.timeSpent = 0;
    $scope.distance = 0.0;
    $scope.substate = 1;
    $scope.devices = BLE.devices;
    $scope.myConnectedDevice = null;
    $scope.BLEisConnected = false;
    $scope.hardStop = false; // when the user presses the stopbutton instead of the autoreusme feature
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



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS DEFINITION //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    Number.prototype.toFixedDown = function (digits) {
      var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
      return m ? parseFloat(m[1]) : this.valueOf();
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function userConnected() {
      // Make the next page the root history
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $ionicLoading.hide();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function userNotConnected(response) {
      // Hide the loading screen
      $ionicLoading.hide();
      // Display a popup
      if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
        PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
      else
        PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    speak = function (text) {
      UtilitiesService.speak(text);
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createStartNotification = function () {
      if ($scope.myActivity.dataLog.length == 1) {
        MapService.setMarkerType(map, data[0].coords, 'start');
        //console.log("First block of code");
        $scope.myActivity.notifications.push({
          metricObject: [{
            type: 'gps',
            lat: data[0].lat,
            lng: data[0].lng,
            time: data[0].time,
            altitude: data[0].altitude,
            timestamp: data[0].timestamp
          }],
          messageObject: [{type: 'text', message: 'NOTIFICATIONS.Start'}]
        });
      }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setTrackPath = function () {
      console.log("setTrackPath "+dataCoords.length );
      for (var i = 0; i < dataCoords.length - 2; i++) {
        map.addPolyline({
          points: [
            dataCoords[i],
            dataCoords[i+1]
          ],
          'color' : "#FFA500",
          'width': 6
        });
      }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    measure_distance = function () {
      // console.log(measure_distance);
      if (tracking == true) {
        if ($scope.substate == 2) {
          if (prevSecond != Math.round($scope.seconds)) {
            prevSecond = Math.round($scope.seconds);
            if (data.length > 1) {
              if (data[data.length - 1] != data[data.length - 2]) {
                var prev = new google.maps.LatLng(data[data.length - 2].coords);
                var last = new google.maps.LatLng(data[data.length - 1].coords);
                console.log("prev: ", prev);
                console.log("last: ", last);
                measurement = google.maps.geometry.spherical.computeDistanceBetween(last, prev);
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
      console.log("handle_geolocation_query RECORD ", $scope.clock);
      $ionicLoading.hide();
      currPosLatLng = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
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
        timestamp: Date.now(),
        is_moving: position.is_moving,
        power: ActivityService.getSmoothPowerOutput(data)
        //activityType : position.activity.type
        //activityTypeConfidence : position.activity.confidence
      };

      //Calculate elevationGain and elevationLoss
      if (typeof $scope.currentMetric.altitude != 'undefined' || $scope.currentMetric.altitude != null) {
        if ($scope.currentMetric.altitude > elevation) {
          elevationGain = +$scope.currentMetric.altitude - elevation;
        } else {
          elevationLoss = +elevation - $scope.currentMetric.altitude;
        }
        elevation = $scope.currentMetric.altitude;
      }
      if ($scope.currentMetric.speed < 0) $scope.currentMetric.speed = 0;// not negative speed
      //Calculate maxspeed
      if ($scope.currentMetric.speed > $scope.maxspeed) {
        $scope.maxspeed = $scope.currentMetric.speed;
      }

      // Move camera along with current position
      if ($state.current.url === "/CreateActivity") {
        map.moveCamera({
          'target': currPosLatLng,
          'tilt': 60,
          'zoom': 18,
          'bearing': 140
        });
      };

      if (!started) {
        map.addMarker({
          'position': currPosLatLng
        }, function(marker) {
          startMarker = marker;
          marker.setIcon({
            'url': 'img/testImageArrow.png',
            'size': {
              width: 40,
              height: 40
            },
            'anchor': [20, 20]
          });
          started = true;
        });
      } else {
        if (startMarker != null) {
          startMarker.setPosition(currPosLatLng);
          startMarker.setRotation( position.coords.heading - 180);
        };
        started = true;
      }

      if (tracking == true) {
        $scope.updateTrackData(); //????
        measure_distance(); //????
        setTrackPath();
      };

    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    stopTracking = function () {
      UtilitiesService.log("EVENT", "stopTracking: (speed) " + $scope.currentMetric.speed);
      tracking = false;
      pauseStartTime = Date.now();
      myElement[0].src = "img/btn_resume.png";
      myElement2[0].src = "img/btn_finish.png";
      UtilitiesService.speak("stop");
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    startTracking = function () {
      UtilitiesService.log("EVENT", "startTracking: (speed) " + $scope.currentMetric.speed);
      $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until activity has been saved)
      $rootScope.hideTabs = true;
      tracking = true;
      pausedTime += pauseStartTime - Date.now();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // save this offset in case the app crushed
      $scope.myActivity.info.resetPausedTime = pausedTime;
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.updateTrackData();
      if ($scope.myActivity.notifications.length === 0) {
        createStartNotification();
      }
      myElement[0].src = "img/btn_stop.png";
      myElement2[0].src = "img/btn_tag.png";
      notificationState = false;
      $scope.loop();
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // $SCOPE FUNCTIONS DEFINITION ////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // BACKSTATE ///////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.backState = function () {
      UtilitiesService.log("EVENT", '>backState()');
      $scope.hardStop = true;
      $rootScope.hideTabs = false; // Reset so tabs come back
      offset = 0;
      pausedTime = 0;
      pauseStartTime = 0;
      tracking = false;
      started = false;
      prevSecond = 0;
      notificationState = false;
      elevationGain = 0;
      elevationLoss = 0;
      $scope.debugMode = false;
      $scope.metricDisplay = 1;
      $scope.maxspeed = 0;
      $scope.averagespeed = 0;
      $scope.clock = 0;
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
      $scope.substate = 1;
      myMetricDiv.style.height = "250px";
      data = [];
      dataCoords = [];
      map.clear();
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.toggleMapType = function(){
      console.log("toggleMapType");
      MapService.toggleMapType(MapService.getMap("map_canvas_4"));
    };

    /// BLE AUTOCONNECT ///////////////////////////////////////////////////////////////////////////////////////////////
    $scope.BLEautoConnect = function () {
      //UtilitiesService.log("BLECONNECT", ">BLEautoConnect()");
      var mybledevice = window.localStorage.getItem("LatestBLEDeviceID");
      if (typeof ble != 'undefined' && mybledevice != null) {
        ble.startScan([],
          function (device) {
            //console.log(JSON.stringify(device));
            // UtilitiesService.log("DEBUG", device.id + " compare to" + mybledevice);
            if (device.id.toString() == mybledevice.toString()) {
              // UtilitiesService.log("DEBUG", ">>success compare");
              myConnectedDevice = device;
              BLE.connect(myConnectedDevice.id).then(
                function () {
                  //UtilitiesService.log("DEBUG", "> $scope.BLE.connect()");
                  window.localStorage.setItem("LatestBLEDevice",
                    myConnectedDevice);
                  window.localStorage.setItem("LatestBLEDeviceID", myConnectedDevice.id);
                  //UtilitiesService.log("DEBUG", "LatestBLEDevice: " + myConnectedDevice.id);
                  var arrayBuffer = BLE.getNotificationBLE(myConnectedDevice.id);
                  $scope.messageReceived = $scope.bytesToString(arrayBuffer);
                  myConnectedDevice.isConnected = true;
                  $scope.BLEisConnected = true;
                  UtilitiesService.speak("device connected");
                  BLE.sendData(myConnectedDevice.id, "141001000");
                  return;
                });
            }
          },
          function () {
            UtilitiesService.log("BLECONNECT", "error scan");
          }
        );
      }
      if ($scope.BLEisConnected == false && testAutoconnect < 5) {
        $timeout($scope.BLEautoConnect, testAutoconnect * 1000);
        //UtilitiesService.log("DEBUG", "test BLEautoConnect number " + testAutoconnect);
        testAutoconnect++;
      }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.forceBLEautoConnect = function () {
      UtilitiesService.log("EVENT","forceBLEautoConnect")
      testAutoconnect = 1;
      $scope.BLEautoConnect();
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.changeNotification = function () {
      UtilitiesService.log("DEBUG", '>changeNotification()');
      notification_name = document.getElementById("notification_name_").value;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.debugMe = function () {
      UtilitiesService.log("DEBUG", '>debugMe()');
      $scope.substate = 2;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.updateTrackData = function () {

      console.log("update Track clock: ", $scope.clock);

      $scope.currentMetric.time = $scope.clock; //force to update the time

      // update the Lastest clock unless the app crush
      $scope.myActivity.info.completedTime = $scope.clock;

      data.push($scope.currentMetric);
      dataCoords.push(data[data.length - 1].coords);
      $scope.myActivity.dataLog = data;
      ActivityService.writeActivityCallback($scope.myActivity)
        .then(function(success) {
          console.log("Write to file success in Callback function");
        }, function(err) {
          console.log("Error: ", err);
        })
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.updateHTML = function () {
      if ($scope.clock != null) {
        console.log("This is the updateHTML clock inside of the IF block: ", $scope.clock);
        $scope.displayClock = UtilitiesService.convertTimeHMS($scope.clock, 3);
      }
      console.log("update HTML clock after if block: ", $scope.clock);
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.loop = function () {
      if ($scope.hardStop != true) {
        //console.log("loop");
        //autoPause
        if ($scope.currentMetric.speed < .4 && mySettings.autoPauseMode != false) //.4m/s is 1.44km/k or 1ms is 3.6km/h
        {
          if (tracking == true) {
            //speak("stop");
            stopTracking();
          }
        } else {
          if (tracking == false) {
            //speak("go");
            startTracking();
          }
        }
        if (tracking == true) {
          if ($scope.substate == 2) {
            //	time_1=time_1+ 0.01;
            now = Date.now();
            $scope.clock = (now - offset) + pausedTime;
            console.log("clock in loop: ", $scope.clock);
            $scope.timeSpent = $scope.clock;
            $scope.updateHTML();
          }
        }
        $timeout($scope.loop, 1000);// instead of setTimeout , it's more angular friendly
      } else {
        console.log("loop exit");
        return;
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.requestTracking = function () {
      UtilitiesService.log("EVENT", "requestTracking");
      setBgGeo_Record();
      $scope.substate = 3; // make it's enough to show buttons in pause mode
      if ($scope.currentMetric.speed > .4 || mySettings.autoStartMode == false) //.4m/s is 1.44km/k or 1ms is 3.6km/h
      {
        UtilitiesService.log("DEBUG", "requestTracking: GO");
        // if (typeof ActivityService.importActivity() == 'undefined') {
        //   $scope.myActivity = ActivityService.newActivity();
        // }
        // else {
        //   $scope.myActivity = ActivityService.importActivity();
        // }//end of myactivity else
        offset = offset || Date.now();

        $scope.substate = 2;
        $scope.hardStop = false;
        pauseStartTime = Date.now();

        startTracking();
      } else {
        $timeout($scope.requestTracking, 500);
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.toggle_tracking = function () {
      UtilitiesService.log("ACTION", '>toggle_tracking() ' + tracking);
      if (tracking == true) {
        $scope.hardStop = true;
        stopTracking();
      } else if (!tracking) {
        $scope.hardStop = false;
        UtilitiesService.speak("go");
        startTracking();
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.tag = function () {
      UtilitiesService.log("tag", 'inside tag() with tracking: ');
      if (tracking || (!tracking && notificationState)) {
        tracking = false;
        notificationState = true;
        pauseStartTime = Date.now();
        //mark the notification position on the map
        // var notMarker =
        //   map.addMarker({
        //   'position': currPosLatLng
        // }, function(marker) {
        //   marker.setIcon({
        //     'url': 'img/gps_tag.png',
        //     'size': {
        //       width: 20,
        //       height: 32
        //     }
        // });
        // });


        $state.go("menu.addNotification", {
          myLat: currPosLatLng.lat,
          myLng: currPosLatLng.lng,
          metrics: $scope.currentMetric,
          myTagId: data.length - 1,
          myTime: $scope.clock
        });
      }
      else if (!tracking) {
        UtilitiesService.log("CREATEACTIVITY", "finish");
        $scope.finish();
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.togglemetricDisplay = function () {
      if ($scope.metricDisplay == 1) {
        $scope.metricDisplay = 2;
        // myMapDiv.style.bottom = "300px";
        myMetricDiv.style.height = "430px";

      } else {

        //myMapDiv.style.bottom=  "230";
        myMetricDiv.style.height = "250px";
        $scope.metricDisplay = 1;
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.finish = function () {
      UtilitiesService.log("CREATEACTIVITY", "inside of finish()");
      //navigator.geolocation.clearWatch(watchProcess);

      //Setting the general info that each activity has, i.e. (Time, distance, number of notifications)
      $scope.myActivity.info = {distance: $scope.distance.toFixedDown(2), completedTime: $scope.timeSpent};

      console.dir(data);
      // i scale down the dataLog to 800ish entry to make sure it uploads

      // $scope.myActivity.dataLog = UtilitiesService.scaleDataLog(data, 800);
      $scope.myActivity.dataLog = data;

      $ionicHistory.nextViewOptions({
        disableBack: false
      });
      // console.log("myActivity on finish: ", JSON.stringify($scope.myActivity));
      $state.go("menu.saveActivity", {deck: myActivity, isBoughtDeck: false});
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.remoteStart = function () {
      if ($scope.substate == 1) {
        UtilitiesService.speak("GO");
        $scope.requestTracking();
        if (typeof myConnectedDevice != 'undefined') {
          BLE.sendData(myConnectedDevice.id, "141001000");
        }
      } else {

        UtilitiesService.speak("New Tag");
        //TODO: set split to the latest place with a speed <0
        var latestMovingData;
        latestMovingData = ActivityService.findLatestMovingData(myActivity.dataLog);

        $scope.myActivity.notifications.push({
          metricObject: [{
            type: 'gps',
            lat: latestMovingData.lat,
            lng: latestMovingData.lng,
            time: latestMovingData.time,
            timestamp: latestMovingData.timestamp,
            altitude: latestMovingData.altitude,
            speed: latestMovingData.speed
          }],
          messageObject: [{type: 'split', id: '1', message: 'Auto BLE Notification'}]
        });
        if (typeof myConnectedDevice != 'undefined') {
          BLE.sendData(myConnectedDevice.id, "141001000");
        }
        // AudioServices.play("createnotif", "mp3", true);
      }

    };

    // Debug
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.addData = function (val) {
      UtilitiesService.log("DEBUG", "addData " + val);
      for (var i = 0; i < val; i++) {
        data.push($scope.currentMetric);
      }
    };

    setBgGeo_Record = function () {
      // UtilitiesService.log("DEBUG", 'setBgGeoRecord setBgGeoRecord setBgGeoRecord setBgGeoRecord setBgGeoRecord setBgGeoRecord setBgGeoRecord ');
      var callbackFn = function (location, taskId) {
        //UtilitiesService.log("DEBUG", 'Record - Location: ', JSON.stringify(location));
        handle_geolocation_query(location);
        var g = GPSService.getBgGeo();
        g.finish(taskId);
      };
      var failureFn = function (errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
      };
      GPSService.killBgGeo();
      GPSService.configureBgGeo();
      GPSService.removeEvents(
        function () {
          GPSService.setEventsRecord(callbackFn, failureFn)
          GPSService.startBgGeo();
        },
        function () {
          console.warn('- BackgroundGeoLocation error: ', errorCode);
        }
      );
    }; // END setBgGeo

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // THIS ONLY RUN ONCE   //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // NEW INIT CTRL ON DOCUMENT/DEVICE READY
    init = function () {
      if (initCount == 0){
        UtilitiesService.log("INIT", " init function CreateActiviy");
      UtilitiesService.log("PLATFORM", ionic.Platform.platform());
      UtilitiesService.checkVersion();
      //$scope.backState();

      dataCoords = [];
      //console.log("dataCoordinate before anything: ", dataCoords);

      // Recover unsaveddata////////////////////////////////////////////////////////////////////////////
      ActivityService.importUnsavedActivity()
        .then(function(currentUnsavedData) {
          UtilitiesService.log("DEBUG", "recover unsaved data");
          console.log("After importing unsaved Activity.....");
          $scope.myActivity = JSON.parse(currentUnsavedData);
          data = $scope.myActivity.dataLog;
          for (var i = 0; i < data.length; i++) {
            var curLat = $scope.myActivity.dataLog[i].lat;
            var curLng = $scope.myActivity.dataLog[i].lng;
            var latLngObj = new plugin.google.maps.LatLng(curLat, curLng);
            // var latLngObj = new plugin.google.maps.LatLng($scope.myActivity.dataLog[i].coords);
             dataCoords.push(latLngObj);
          }
          setTrackPath();
          // Reset distance
          $scope.distance = ActivityService.getTotalDistance($scope.myActivity.dataLog);
          $scope.displayDistance = $scope.distance.toFixed(2);
          // Reset clock
          offset = $scope.myActivity.dataLog[0].timestamp;
          pausedTime = $scope.myActivity.info.resetPausedTime;
          $scope.clock = $scope.myActivity.info.completedTime;
          $scope.timeSpent = $scope.clock;
          $scope.displayClock = UtilitiesService.convertTimeHMS($scope.myActivity.info.completedTime, 3);



        }, function(fail) {
          $scope.myActivity = ActivityService.newActivity();
          UtilitiesService.log("DEBUG", "No data ro recover so we create a new activity");
          //console.log("Fail to import Activity, newActivity is being created: ", $scope.myActivity);
        });
      /// end recover data


      //////////////// USER CONNECTION MANAGEMENT //////////////////////////////////////////////////////////////////////
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

      // LOAD SETTINGS
      var mySettings = SettingService.getSettings();

      $scope.unit = mySettings.unit;
      $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
      $scope.bluetoothMode = mySettings.bluetoothMode;
      // UtilitiesService.log("DEBUG", "bluetoothMode  " + $scope.bluetoothMode);
      // UtilitiesService.log("DEBUG", "---------------------  " + $scope.unit);
      // UtilitiesService.log("DEBUG", ">debugMode in localstorage is: " + mySettings.debugMode);

    }
      initCount++;
    };// END DEVICE READY

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $ionicLoading.show({template: $translate.instant('UTILS.Loading') + ' ...'});


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BEFORE ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.beforeEnter', function (scopes, states) {
      UtilitiesService.log("DEBUG", 'CreateActivity >> $ionicView.beforeEnter');
      init();

      setBgGeo_Record();

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

      map = MapService.getMap("map_canvas");
      if (startMarker != null) {
        startMarker.remove();
      };
      started = false;
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.enter', function (scopes, states) {
      UtilitiesService.log("DEBUG", 'CreateActivity >> $ionicView.enter ');



      $scope.myActivity = ActivityService.importActivity();
      setBgGeo_Record();

      tagListener = $scope.$on('GetNotifEvent',
        function (event, data) {
          UtilitiesService.log("DEBUG", ">GetNotifEvent()");
          if (data.value == "TAG") {
            $scope.remoteStart();
          }
        });
      // Update Settings
      mySettings = SettingService.getSettings();
      $scope.debugMode = mySettings.debugMode;
      $scope.bluetoothMode = mySettings.bluetoothMode;

      if (mySettings.bluetoothMode) $scope.BLEautoConnect();

      isclockStartRequest = $rootScope.isClockStartRequest;
      if (isclockStartRequest == true) {
        $rootScope.isClockStartRequest = false;
        startTracking();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON LEAVE //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.leave', function () {
      UtilitiesService.log("DEBUG", 'CreateActivity >> $ionicView.leave');
      // tagListener(); // remove listener
      tagListener = null;
      if (startMarker != null) {
        startMarker.remove();
      };
      started = false;
    });

  }

  CreateActivityCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicHistory', '$ionicLoading', '$cordovaFile', '$rootScope', '$translate', '$timeout', 'AudioServices', 'UserService', 'PopupService', 'ActivityService', 'BLE', 'UtilitiesService', 'SettingService', 'MapService', '$ionicSideMenuDelegate', 'GPSService']

}());
