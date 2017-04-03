(function () {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('PlayActivityCtrl', function ($scope, $stateParams, $state, $timeout, $ionicLoading, $translate, $ionicPopover, $ionicHistory, $ionicSideMenuDelegate, $rootScope, PopupService, ActivityService, UserService, AudioServices, BLE, SettingService, UtilitiesService, MapService, $ionicPlatform, GPSService) {
    UtilitiesService.log("ENTERPAGE", "PlayActivity");

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // VARIABLES DEFINITION //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //This is your activity variable whose properties you can manipulate
    $scope.showNotification = false;
    $scope.triggerNotification = false;
    $scope.substate = 2;
    $scope.distance = 0;
    $scope.mapReady = false;
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
      timestamp: 0
    };

    var map;
    var dataCoords = [];

    var data = [];
    var allPos = []; // All datalog positions
    var allgPos = []; // All datalog positions

    var total_distance = 0;
    var bounds = new google.maps.LatLngBounds();
    //var watchProcess = null;
    var started = false;
    var finished = false;
    var posMarker = null;
    var isClockStopped = true;
    var stopButton = angular.element(document.querySelector('#stop_clock_button'));
    var stopButton2 = angular.element(document.querySelector('#stop_clock_button2'));
    var current_position = null;
    var currPosLatLng = null;
    var myTimeout = null;
    var offset = Date.now();
    var clock = Date.now();
    var storage = window.localStorage;
    //var splitcollection = [];
    var mySettings = SettingService.getSettings();
    var timeoutDuration = mySettings.timeoutDuration;
    var tagPlayListener;
    var currentActivity;

    var distanceFromNotif;
    var notif = {};
    var msgObject = {};
    var segmentIntervalSaved = 0;
    var segmentCurrentInterval = 0;
    var segmentDeltaTime = 0;
    var currentNotificationIndex = -1;
    var tempdistance = null;
    var myActivity;
    var tracking = false;
    var startMarker = null;
    var latLngBounds;
    var trackPath;

    $scope.unit = mySettings.unit;
    $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);

    /* Get all stored variables */
    $scope.inRad = parseInt(storage.getItem("in-rad"));
    $scope.exRad = parseInt(storage.getItem("ex-rad"));
    $scope.fgFrequency = parseInt(storage.getItem("fg-freq"));
    $scope.bgFrequency = parseInt(storage.getItem("bg-freq"));
    $scope.displayDistance = 0;
    $scope.inRad = 10;
    $scope.exRad = 15;
    $scope.fgFrequency = 1000;
    $scope.bgFrequency = 1000;
    // $scope.timeoutDuration = 4000;

    $scope.isMsgTxt = false;
    $scope.isMsgAudio = false;
    $scope.isMsgBLE = false;
    $scope.hour = 0;
    $scope.minute = 0;
    $scope.seconds = 0.0;
    $scope.time = "00:00:00";
    $scope.secondsAdder = 0.01;

    $scope.substate = 1;
    $scope.bluetoothDevice = null; //object containing info on connected bluetooth device
    $scope.devices = BLE.devices;
    $scope.myConnectedDevice = null;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS DEFINITION //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.playActivity = function () {
      UtilitiesService.log("PLAYACTIVITY", 'playing this activity');
      if ($scope.substate == 1) {
        $scope.substate = 2;
        clock = 0;
        myTimeout = $timeout(wait, $scope.millisecondsInterval);
        offset = Date.now();
        isClockStopped = false;
        tracking = true;
      }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.connecting = function (device) {
      $scope.bluetoothDevice = device;
      BLE.connect(device.id);
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function findPreviousSplit(arr, value) {
      console.log("findPreviousSplit of first " + value + " is " + arr);
      console.dir(arr);
      console.log("----------------------------------------");
      for (var i = 1, iLen = arr.length; i < iLen; i++) {
        if (arr[i].id == value) {
          console.log("previous of " + value + " is " + arr[i - 1]);
          return arr[i - 1];
        }
      }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function triggerBLE(value) {

      if (typeof myConnectedDevice != 'undefined') {
        UtilitiesService.log("BLECONNECT", 'triggerBLE BLE' + value);
        BLE.sendData(myConnectedDevice.id, value);
      }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.ResetNotification = function () {
      UtilitiesService.log("DEBUG", ">ResetNotification()");
      $scope.showNotification = false;
      $scope.isMsgTxt = false;
      $scope.isMsgAudio = false;
      $scope.isMsgBLE = false;
      $scope.$apply();
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function measureDistance() {
      //distance calculated here
      console.log("currentActivity.dataLog.length " + currentActivity.dataLog.length);
      if (currentActivity.dataLog.length > 1) {
        var measurement;
        //if (tempdistance == null) tempdistance = currPosLatLng;

        if (currentActivity.dataLog[currentActivity.dataLog.length - 1] != currentActivity.dataLog[currentActivity.dataLog.length - 2]) {
          var prev = new google.maps.LatLng(currentActivity.dataLog[currentActivity.dataLog.length - 2].coords);
          var last = new google.maps.LatLng(currentActivity.dataLog[currentActivity.dataLog.length - 1].coords);
          measurement = google.maps.geometry.spherical.computeDistanceBetween(last, prev);
          //currPosLatLng, currentActivity.dataLog[currentActivity.dataLog.length - 1].coords
        }
        console.log("measurement " + measurement);

        // tempdistance = currPosLatLng;
        if (measurement > 0) {
          $scope.distance += Number(measurement);
        }
      }

      if (isClockStopped == false) { // if the clock is running
        for (var i = 0; i < myActivity.notifications.length; i++) {
          notif = myActivity.notifications[i];
          distanceFromNotif = 0;
          if (!$scope.showNotification) {
            distanceFromNotif = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(currPosLatLng), new google.maps.LatLng({
              lat: notif.metricObject[0].lat,
              lng: notif.metricObject[0].lng
            })); //TODO: no nned for intermediate notifpos
            if (distanceFromNotif < $scope.inRad && currentNotificationIndex != i) { // you are inside the radius: notification is true
              currentNotificationIndex = i;
              if (i == 0) {
                console.log("going thru starting point");
                console.dir(currPosLatLng);
                console.dir($scope.currentMetric);
                console.log("lat : " + currentActivity.notifications[i].metricObject.lat);
                currentActivity.notifications[i].metricObject.push({
                  type: "gps",
                  lat: $scope.currentMetric.lat,
                  lng: $scope.currentMetric.lng,
                  altitude: $scope.currentMetric.altitude,
                  speed: $scope.currentMetric.speed,
                  time: clock,
                  timestamp: $scope.currentMetric.timestamp
                });

                $scope.showNotification = true;
                $scope.currNotification = "Start";
                $timeout($scope.ResetNotification, timeoutDuration); //
              } else {


                UtilitiesService.log("DEBUG", "notifications is true : " + notif.messageObject.length);
                $scope.showNotification = true;
                $timeout($scope.ResetNotification, timeoutDuration); // something is true then reset in 4000

                for (var j = 0; j < myActivity.notifications[i].messageObject.length; j++) {
                  msgObject = myActivity.notifications[i].messageObject[j];
                  UtilitiesService.log("DEBUG", msgObject.type + " : msgObject.type : " + notif.messageObject.length);
                  // console.log(distanceFromNotif + " msgObject.type " +msgObject.type);
                  console.dir(msgObject);
                  //TEXT NOTIFICATION ///
                  if (msgObject.type == "text") {
                    UtilitiesService.log("DEBUG", "type : text");
                    $scope.isMsgTxt = true;
                    $scope.currNotification = msgObject.message;
                    UtilitiesService.speak(msgObject.message);
                    if (typeof myConnectedDevice != 'undefined') {
                      BLE.sendData(myConnectedDevice.id, "141001000");
                    }
                    // document.addEventListener('deviceready', function () {
                    //   TTS.speak(msgObject.message, function () {
                    //     //alert('success');
                    //   }, function (reason) {
                    //     //alert(reason);
                    //   });
                    // });
                  }
                  //AUDIO NOTIFICATION ///
                  else if (msgObject.type == "audio") {
                    UtilitiesService.log("DEBUG", "type : audio");
                    $scope.isMsgAudio = true;
                    var preDef;
                    if (msgObject.format != 'mp3') {
                      preDef = false;
                    } else {
                      preDef = true;
                    }
                    UtilitiesService.log("DEBUG", 'playing audio notification');
                    AudioServices.play(msgObject.filename, msgObject.format, preDef);
                  }
                  //BLE NOTIFICATION ///
                  else if (msgObject.type == "BLE") {
                    UtilitiesService.log("DEBUG", "type : BLE");
                    $scope.isMsgBLE = true;
                    $scope.currNotification += "-" + msgObject.name;
                    if (typeof myConnectedDevice != 'undefined') {
                      BLE.sendData(myConnectedDevice.id, msgObject.name);
                    }
                    //END BLE
                  }
                  //SPLIT NOTIFICATION //
                  else if (msgObject.type == "split" || msgObject.type == "autosplit") {
                    UtilitiesService.log("DEBUG", "type : " + msgObject.type);
                    $scope.isMsgTxt = true;
                    $scope.currNotification = "SPLIT ";
                    // var intervalSaved = myActivity.notifications[i + 1].metricObject[0].time - Number(myActivity.notifications[0].metricObject[0].time);
                    // var currentInterval = clock;
                    // var deltaTime = intervalSaved - currentInterval;
                    // UtilitiesService.log("DEBUG", "compare: " + intervalSaved + " - " + currentInterval + " = " + deltaTime + "offset" + clock);


                    // from previous segment
                    // var segmentIntervalSaved = myActivity.notifications[i].metricObject[0].time - findPreviousSplit(splitcollection, i).time;
                    // var previousCurSplitNotif = currentActivity.notifications[ findPreviousSplit(splitcollection, i).id];
                    // var lastSplitPreviousSplitTime = previousCurSplitNotif.metricObject[previousCurSplitNotif.metricObject.length -1].time;
                    // var segmentCurrentInterval = (Number(clock)) - lastSplitPreviousSplitTime;
                    // var segmentDeltaTime = segmentIntervalSaved - segmentCurrentInterval;
                    var segmentIntervalSaved = myActivity.notifications[i].metricObject[0].interval;
                    var previousId = myActivity.notifications[i].messageObject[j].splitOrigin;
                    var previousCurrentActivity = currentActivity.notifications[previousId].metricObject;

                    if (previousCurrentActivity.length > 1) { // is user went thru splitOrgin
                      var segmentCurrentInterval = (Number(clock)) - previousCurrentActivity[previousCurrentActivity.length - 1].time;
                    } else { // oh shit! no splitOrigin for this notif so we just used the original value: yes it's wrong but it gives the user something!!
                      if (previousId == 0) {
                        var segmentCurrentInterval = (Number(clock));
                      } else {
                        var segmentCurrentInterval = (Number(clock)) - myActivity.notifications[previousId].metricObject[0].time;
                      }

                      // - myActivity.notifications[i].metricObject[0].time;
                    }
                    var segmentDeltaTime = segmentIntervalSaved - segmentCurrentInterval;

                    console.log("======================================");
                    console.log("i: " + i + " j: " + j);
                    console.log("previousId : " + previousId);
                    console.log("split Origin : " + myActivity.notifications[i].messageObject[j].splitOrigin);
                    console.log("previousCurrentActivity : " + (previousCurrentActivity.length - 1));
                    console.log("segmentIntervalSaved : " + segmentIntervalSaved);
                    console.log("segmentCurrentInterval : " + segmentCurrentInterval);
                    console.log("saved time : " + myActivity.notifications[i].metricObject[0].time);
                    console.log("lat : " + currentActivity.notifications[i].metricObject.lat);
                    console.dir(currentActivity.notifications[i].metricObject);
                    console.log("======================================");

                    //assign the new value
                    //currentActivity.notifications[i].metricObject[0].time = (Number(clock));
                    currentActivity.notifications[i].metricObject.push({
                      type: "gps",
                      lat: $scope.currentMetric.lat,
                      lng: $scope.currentMetric.lng,
                      altitude: $scope.currentMetric.altitude,
                      speed: $scope.currentMetric.speed,
                      time: clock,
                      delta: segmentDeltaTime,
                      interval: segmentCurrentInterval
                    });


                    if (msgObject.name == "NOTIFICATIONS.Finish") {
                      var metricLast = currentActivity.notifications[i].metricObject.length - 1;
                      var lapTime = (currentActivity.notifications[i].metricObject[metricLast].time - currentActivity.notifications[0].metricObject[metricLast].time)
                      //console.log("Final Time : " + currentActivity.notifications[i].metricObject[metricLast].time + " - " + currentActivity.notifications[0].metricObject[metricLast].time);
                      currentActivity.notifications[i].metricObject[metricLast].lapTime = lapTime;
                      //console.log("laptime" + currentActivity.notifications[i].metricObject[metricLast].lapTime);

                    }
                    console.log("lat2 : " + currentActivity.notifications[i].metricObject.lat);

                    UtilitiesService.log("DEBUG", "compare: " + segmentIntervalSaved + " - " + segmentCurrentInterval + " = " + segmentDeltaTime);
                    //start BLE
                    if (segmentDeltaTime > 0) {
                      $scope.currNotification += "faster " + Math.abs(Math.round(segmentDeltaTime / 100) / 10);
                      UtilitiesService.log("DEBUG", "faster");
                      //triggerBLE("111001000");
                      // AudioServices.play("faster", "mp3", true);
                      if (typeof myConnectedDevice != 'undefined') {
                        BLE.sendData(myConnectedDevice.id, "111001000");
                      }
                    } else {
                      $scope.currNotification += "slower " + Math.abs(Math.round(segmentDeltaTime / 100) / 10);
                      UtilitiesService.log("DEBUG", "slower");
                      triggerBLE("101001000");
                      // AudioServices.play("slow", "mp3", true);
                      if (typeof myConnectedDevice != 'undefined') {
                        BLE.sendData(myConnectedDevice.id, "101001000");
                      }
                    }
                    // say message
                    UtilitiesService.speak($scope.currNotification + " seconds");

                    // cordova.plugins.notification.local.hasPermission(function(granted){
                    //     if(granted == true)
                    //     {
                    //       schedule();
                    //     }
                    //     else
                    //     {
                    //       cordova.plugins.notification.local.registerPermission(function(granted) {
                    //           if(granted == true)
                    //           {
                    //             schedule();
                    //           }
                    //           else
                    //           {
                    //             navigator.notification.alert("Reminder cannot be added because app doesn't have permission");
                    //           }
                    //       });
                    //     }
                    //   });
                    ///////////////////////////////////////////

                  }//END SPLIT
                  //loop thu message oject

                  scheduleOne($scope.currNotification, msgObject.type, myActivity.name, currentActivity.notifications[i].metricObject.length - 1, currentActivity.notifications[i].messageObject[0].name);
                }
              }
            }// if distance in radius
          } //if showNotification
        } //notification loop
      } // end if clock
    }

    function scheduleOne(notifMsg, notifName, activityName, lap, nameAz) {

      //var date = new Date();
      //console.log("localnotif");
      var date = new Date();

      cordova.plugins.notification.local.schedule({
        id: 1,
        title: activityName,
        text: notifName + " : " + nameAz + " | Lap: " + lap + " | " + notifMsg,
        at: date,
        every: "year",
        sound: null
      });


    }

    //end measureDistance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.updateHTML = function () {
      if (typeof clock != 'undefined') $scope.displayClock = UtilitiesService.convertTimeHMS(clock, 3);
      if (typeof $scope.currentMetric.speed != 'undefined' && $scope.currentMetric.speed != null) $scope.displaySpeed = $scope.currentMetric.speed.toFixed(2);
      $scope.displayAveragespeed = $scope.distance / ($scope.timeSpent / 1000);//Note: timeSpent is in Ms
      if (typeof $scope.currentMetric.accuracy != 'undefined') $scope.displayAccuracy = $scope.currentMetric.accuracy;
      $scope.displayDistance = $scope.distance;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.testSplitTime = function () {
      UtilitiesService.log("DEBUG", "testSplitTime");
      console.dir(currentActivity);
      //triggerBLE("141001000");
      AudioServices.play("alert", "mp3", true);
      BLE.sendData(myConnectedDevice.id, "141001000");
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.updateTrackData = function () {
      $scope.currentMetric.time = $scope.clock; //force to update the time
      //data.push($scope.currentMetric);
      dataCoords.push($scope.currentMetric.coords);
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Programming equivalent to MAIN
    function wait() {
      if (!isClockStopped) {
        //console.log("I HATE THIS");
        //  time_1=time_1+ 0.01;
        var now = Date.now();
        clock += (now - offset);
        offset = now;
        // console.log((clock/1000)%60);
        $scope.seconds = ((clock / 1000) % 60);
        $scope.minute = ((clock / 60000) % 60);
        $scope.hour = ((clock / 3600000) % 24);
        $scope.time = ($scope.hour < 10 ? "0" : "") + $scope.hour.toFixedDown(0) + ":" + ($scope.minute < 10 ? "0" : "" ) + $scope.minute.toFixedDown(0) + ":" + ($scope.seconds < 10 ? "0" : "" ) + $scope.seconds.toFixedDown(0);

        $scope.updateHTML();

        if (current_position != null)
        //measureDistance();
          myTimeout = $timeout(wait, 500); //update every 500ms
      }
      else return;
    }//End of wait
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    setTrackPath = function () {
      console.log("setTrackPath " + dataCoords.length);
      for (var i = 0; i < dataCoords.length - 2; i++) {
        map.addPolyline({
          points: [
            dataCoords[i],
            dataCoords[i + 1]
          ],
          'color': "#FFA500",
          'width': 6
        });
      }
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function handle_geolocation_query(position) {
      //console.log("handle_geolocation_query Play");
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
        timestamp: position.timestamp
      };
      // if (typeof $scope.currentMetric.heading != 'undefined')
      //   posIcon.rotation = $scope.currentMetric.heading;

      currentActivity.dataLog.push($scope.currentMetric);
      current_position = position;
      $scope.updateHTML();
      data.push($scope.currentMetric);
      dataCoords.push(data[data.length - 1].coords);

      // Move camera along with current position


      if (!started) {
        map.addMarker({
          'position': currPosLatLng
        }, function (marker) {
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


        started = true;
      }
      if (startMarker != null) {
        startMarker.setPosition(currPosLatLng);
        startMarker.setRotation(position.coords.heading - 180);
      }
      if (tracking == true) {
        //if ($state.current.url === "/PlayActivity") {
          map.moveCamera({
            'target': currPosLatLng,
            'tilt': 60,
            'zoom': 18,
            'bearing': 140
          });
       //}
        setTrackPath();
        $scope.updateTrackData(); //????
        measureDistance(); //????
      } else{
        map.moveCamera({
          'target': latLngBounds
        });

      }


    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setBgGeo_Player = function () {
      //UtilitiesService.log("GPS", 'setBgGeo PLAY PLAY PLAY PLAY PLAY PLAY PLAY PLAY PLAY PLAY PLAY');
      var callbackFn = function (location, taskId) {
        //UtilitiesService.log("GPS", 'Play - Location: ', JSON.stringify(location));
        handle_geolocation_query(location);
        var g = GPSService.getBgGeo();
        g.finish(taskId);
      };
      var failureFn = function (errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
      };

      //GPSService.configureBgGeo();
      //GPSService.stopBgGeo();
      GPSService.removeEvents(
        function () {
          GPSService.setEventsPlay(callbackFn, failureFn);
          //GPSService.startBgGeo();
        },
        function () {
          console.warn('- BackgroundGeoLocation error: ', errorCode);
        }
      );
    };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.toggleMapType = function(){
      MapService.toggleMapType(MapService.getMap("map_canvas_4"));
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /* Handles stopping and restarting the clock */
    $scope.toggleClock = function () {
      UtilitiesService.log("ACTION", ">toggleClock()");

      if (!isClockStopped) { // clock is running

        isClockStopped = true;
        $timeout.cancel(myTimeout);
        stopButton[0].src = "img/btn_resume_orange.png";
        // stopButton2[0].src = "img/btn_resume.png";
        tracking = false;
        return;
      }
      else if (isClockStopped) { //clock is stopped
        isClockStopped = false;
        stopButton[0].src = "img/btn_stop_white.png"
        //stopButton2[0].src = "img/btn_stop_white.png"
        myTimeout = $timeout(wait, $scope.millisecondsInterval);
        offset = Date.now();
        tracking = true;

      }
    };


//////////////////////////////////////////////////////////////////////////////////////////////////
    /* finish the play sequence and send to the finish page */
    $scope.finish = function () {
      console.dir(currentActivity.info);
      console.dir(myActivity.info);
      currentActivity.info.completedTime = clock; //TODO: is is the real variabe;???
      UtilitiesService.log("FINISHACTIVITY", ">finish()");
      $timeout.cancel(myTimeout);
      //navigator.geolocation.clearWatch(watchProcess);
      $state.go("menu.completeActivity", {activity: myActivity, currentActivity: currentActivity, time: clock})
    };
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.playActivity = function () {
      UtilitiesService.log("PLAYACTIVITY", 'playing this activity');
      if ($scope.substate == 1) {
        $scope.substate = 2;
        clock = 0;
        myTimeout = $timeout(wait, $scope.millisecondsInterval);
        offset = Date.now();
        isClockStopped = false;
        tracking = true;
      }
    };
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.goBack = function () {
      //$ionicSideMenuDelegate.canDragContent(true);
      $ionicHistory.goBack();
    };
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.endActivity = function () {
      $scope.toggleClock();
      //navigator.geolocation.clearWatch(watchProcess);
      $ionicSideMenuDelegate.canDragContent(true);
      $rootScope.hideTabs = false;
      $ionicHistory.goBack();
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.tagButton = function () {
      if ($scope.substate == 1) {
        if ($scope.substate == 1) {
          $scope.substate = 2;
          clock = 0;
          myTimeout = $timeout(wait, $scope.millisecondsInterval);
          offset = Date.now();
          isClockStopped = false;
          $scope.apply();
        } else {
          //stop timer
          $scope.clockStopped();
        }
        if (typeof myConnectedDevice != 'undefined') {
          BLE.sendData(myConnectedDevice.id, "111001000");
        }
        AudioServices.play("start", "mp3", true);
      }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BEFORE ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.$on('$ionicView.beforeEnter', function (scopes, states) {

      UtilitiesService.log("$ionicView.enter", 'PlayActivity >> $ionicView.beforeEnter');
      $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until return to all activities screen or finish playing)

      myActivity = $stateParams.activity;
      console.log("myactivity---------------------------------------------------------------")
      console.dir(myActivity)
      if ($stateParams.activity == null) {
        myActivity = ActivityService.newActivity();
      }


      ActivityService.getDataLog(myActivity.dataLogFilename)
        .then(function (theLog) {


          myActivity.dataLog = theLog.dataLog;
          currentActivity = angular.copy(myActivity);
          $scope.activity = myActivity;

          $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until activity has been saved)
          $rootScope.hideTabs = true;

          // tracking = true;
          // $scope.substate = 2;
          // $scope.button_state = 1;

//pushing lat/lng to allPos array-> Setting up coordinates

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

          map = MapService.getMap("map_canvas_4");
          map.clear();
         // $scope.map = map;



          ///MAP SETUP //////////////////////////////////////////////////////
          // map setup
          for (var i = 0 in myActivity.dataLog) {
            var curLat = myActivity.dataLog[i].lat;
            var curLng = myActivity.dataLog[i].lng;
            var pos = new plugin.google.maps.LatLng(curLat, curLng);
            allPos.push(pos);
          }


          trackPath = map.addPolyline({
            'points': allPos,
            'color': 'rgba(0, 165, 255, 0.8)',
            'width': 5,
            'geodesic': true
          });

          latLngBounds = new plugin.google.maps.LatLngBounds(allPos);

          map.animateCamera({
            'target': latLngBounds
          }, function(){

            }
          );


          // Initial start marker
          MapService.setMarkerType(map, allPos[0], 'start');

          // Final marker
          MapService.setMarkerType(map, allPos[allPos.length - 1], 'finish');

          // Notification markers
          for (var i = 1; i < myActivity.notifications.length - 1; i++) {
            myActivity.notifications[i].metricObject.forEach(function (metric, index, array) {
              if (metric.type == "gps") {
                var notifPosition =
                  new plugin.google.maps.LatLng(metric.lat, metric.lng);
                //MapService.setMarker(map, notifPosition, MapService.getnotifImg().url);
                MapService.setMarkerType(map, notifPosition, 'normal');


              }
            }, this);
          }


          //end map setup
          $scope.mapReady = true;

          setBgGeo_Player();

        });//end get datalog

      // if (!isClockStopped) {
      //   clock = 0;
      //   offset = Date.now();
      //   myTimeout = $timeout(wait, $scope.millisecondsInterval);
      // }
      // else return;

    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON ENTER //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.$on('$ionicView.enter', function () {
      UtilitiesService.log("$ionicView.enter", 'PlayActivity >> $ionicView.enter');


      tagPlayListener = $scope.$on('GetNotifEvent', function (event, data) {
        UtilitiesService.log("DEBUG", ">GetNotifEvent() from BLE");
        if (data.value == "TAG") {
          $scope.tagButton();
        }
      });
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ON LEAVE //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.$on('$ionicView.leave', function () {
      tagPlayListener(); // remove listener
      tagPlayListener = null;

    });
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  })
})();
