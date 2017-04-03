( function() {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('PlayActivityCtrl', function($scope, $stateParams, $state, $timeout, $ionicLoading, $translate, $ionicPopover, $ionicHistory, $ionicSideMenuDelegate, $rootScope, PopupService, ActivityService, UserService, AudioServices, BLE, SettingService, $ionicPlatform) {

    //This is your activity variable whose properties you can manipulate
    var myActivity  = $stateParams.activity;
    var currentActivity =angular.copy(myActivity);
    currentActivity.dataLog=[];

    console.dir(myActivity);
    console.dir(currentActivity);

    $scope.activity = myActivity;
    $scope.showNotification = false;
    $scope.triggerNotification = false;
    $scope.detectioncount = 0;
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
    /****************************************************************************************************************************************************/

    var map;
    var x = 0;
    var xMin = 1000;
    var xMax = -1000;
    var xA = [];
    var yA = [];
    var allPos = []; // All datalog positions
    var notifPos = []; // All notification positions
    var k = 0;
    var y = 0;
    var yMin = 1000;
    var yMax = -1000;
    var total_distance = 0;
    var bounds = new google.maps.LatLngBounds();
    var watchProcess = null;
    var started = false;
    var finished = false;
    var posMarker = null;
    var clockStopped = true;
    var stopButton = angular.element( document.querySelector('#stop_clock_button'));
    var stopButton2 = angular.element( document.querySelector('#stop_clock_button2'));
    var prevSecond = 0;
    var current_position = null;
    var currPosLatLng = null;
    var triggeredIndex = -1;
    var myTimeout = null;
    var offset;
    var clock;
    var storage = window.localStorage;

    /* Get all stored variables */
    $scope.inRad = parseInt(storage.getItem("in-rad"));
    $scope.exRad = parseInt(storage.getItem("ex-rad"));
    $scope.fgFrequency = parseInt(storage.getItem("fg-freq"));
    $scope.bgFrequency = parseInt(storage.getItem("bg-freq"));

    $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until return to all activities screen or finish playing)

    $scope.playActivity = function(){
      console.log('playing this activity');
      if ($scope.substate == 1) {
        $scope.substate = 2;
        clock = 0;
        myTimeout = $timeout(wait, $scope.millisecondsInterval);
        offset = Date.now();
        clockStopped = false;
      }
    };

    $scope.substate = 2;
    $ionicSideMenuDelegate.canDragContent(false); // Prevent dragging to see side menu (continues until activity has been saved)
    $rootScope.hideTabs = true;
    tracking = true;

    $scope.button_state = 1;

    /* Set defaults (if needed), for undefined stored variables */
    //TODO: it has been changed to a settingsService setting object - in progress
    // if (!$scope.inRad || $scope.inRad < 0)
    //     $scope.inRad = 10;
    // if (!$scope.exRad || $scope.exRad < 0)
    //     $scope.exRad = 15;
    // if (!$scope.fgFrequency || $scope.fgFrequency < 0)
    //     $scope.fgFrequency = 1000;
    // if (!$scope.bgFrequency || $scope.bgFrequency < 0)
    //     $scope.bgFrequency = 1000;

    $scope.inRad = 10;
    $scope.exRad = 15;
    $scope.fgFrequency = 1000;
    $scope.bgFrequency = 1000;

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
    $scope.myConnectedDevice =null;

    $scope.connecting = function(device){
      $scope.bluetoothDevice = device;
      BLE.connect(device.id);
    };

//pushing lat/lng to allPos array-> Setting up coordinates
    for (var i = 0 in myActivity.dataLog){
      var curLat = myActivity.dataLog[i].lat;
      var curLng = myActivity.dataLog[i].lng;
      var curTime = myActivity.dataLog[i].time;
      var pos = new google.maps.LatLng({lat:curLat, lng: curLng});
      allPos.push(pos);

      if (i != 0){
        total_distance=total_distance+Math.round(google.maps.geometry.spherical.computeDistanceBetween (allPos[i], allPos[i-1]));
      }
      if (xMin > curLat ) {
        xMin = curLat ;
      }
      if (xMax < curLat ) {
        xMax = curLat ;
      }
      if (yMin > curLng ) {
        yMin = curLng;
      }
      if (yMax < curLng ) {
        yMax = curLng;
      }

      x = x + curLat;
      xA.push( curLat );
      y = y + curLng;
      yA.push( curLng );
    }

//Setting up notification array with coordinates only

    for(var i=1; i < myActivity.notifications.length; i++) {
      var curLat = myActivity.notifications[i].metricObject[0].lat;
      var curLng = myActivity.notifications[i].metricObject[0].lng;
      var curTime = myActivity.notifications[i].metricObject[0].time;
      var pos = new google.maps.LatLng({lat:curLat, lng: curLng});
      notifPos.push(pos);
      //notifPos.triggered.push(false);
    }

    // console.dir(notifPos);

    //Scaling the map to fit on screen?
    if (myActivity.dataLog.length > 1){
      var scaleValX= Math.abs( 1/(Math.max.apply(null,xA) - Math.min.apply(null,xA)) );
      if (isFinite(scaleValX)==false){scaleValX=0;}
      //if (scaleValX>1000){scaleValX=1000;}
      //alert(scaleValX);
      var scaleValY= Math.abs( 1/(Math.max.apply(null,yA) - Math.min.apply(null,yA)) );
      if (isFinite(scaleValY)==false){scaleValY=0;}
      //if (scaleValY>1000){scaleValY=1000;}
      //alert(scaleValY);
      if (scaleValX>scaleValY){
        scaleVal=scaleValY*.9;
      }else{
        scaleVal=scaleValX*.9;
      }

      //alert(scaleVal);

      scaleVal=scaleVal/350;
      scaleVal=scaleVal+15;
    }else{
      scaleVal=17;
    }

    //center of the map shown to user
    var cent =new google.maps.LatLng({lat: (xMin+xMax)/2, lng: (yMin+yMax)/2	});

    //map options
    var myOptions = {
      zoom: Math.round(scaleVal),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      draggable: false
    };

    //actual map object
    map = new google.maps.Map(document.getElementById("map_canvas_4"), myOptions);

    //map path
    var trackPath = new google.maps.Polyline({
      path: allPos,
      strokeColor: "#FFA500",
      strokeOpacity: 0.8,
      strokeWeight: 5
    });
    trackPath.setMap(map); //pushing line into map

    //makes sure all the points are shown on screen
    myActivity.dataLog.forEach(function(element) {
      bounds.extend(new google.maps.LatLng({lat: element.lat, lng: element.lng}));
    }, this);
    map.fitBounds(bounds);

    map.panTo(cent);

    //initial marker image
    var startImg = {
      url: 'img/gps_marker_start.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(28, 38),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(14, 38)
    };

    // Final marker image
    var finishImg = {
      url: 'img/gps_marker_finish.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(28, 38),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(14, 38)
    };

    // Initial start marker
    var start_marker = new google.maps.Marker({
      position: allPos[0],
      map: map,
      size: new google.maps.Size(10, 10),
      icon: startImg
    });

    // Final marker
    var finish_marker = new google.maps.Marker({
      position: allPos[allPos.length - 1],
      map: map,
      size: new google.maps.Size(10, 10),
      icon: finishImg
    });

    //Other markers
    var notifImg = {
      url: 'img/gps_marker.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(28, 38),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(14, 38)
    };

    var posIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 8,
      fillColor: "white",
      fillOpacity: 0.8,
      strokeWeight: 1,
      rotation: 90 //this is how to rotate the pointer
    };

    // angular.forEach(myactivity.notifications, function(curNot, index) {
    //     // alert();
    //     var leg_1_marker = new google.maps.Marker({
    //         position: curCard.tag[0],
    //         map: map,
    //         size: new google.maps.Size(10, 10),
    //         icon: image2
    //     });
    // });

    //Display a marker per notification
    for( var i = 1; i < myActivity.notifications.length - 1; i++ ) {
      myActivity.notifications[i].metricObject.forEach(function(metric, index, array) {
        if(metric.type == "gps") {
          var leg_1_marker = new google.maps.Marker({
            position: new google.maps.LatLng({lat: metric.lat, lng: metric.lng}),
            map: map,
            size: new google.maps.Size(10, 10),
            icon: notifImg
          });
        }
      }, this);
    }

    //Map style only
    var styles = [
      {
        stylers: [
          { hue: "#808080" },
          { saturation: -100 },
          {lightness: -30}
        ]
      },{
        featureType: "road.local",
        elementType: "geometry",
        stylers: [
          { saturation: -20},
          { visibility: "simplified"},
          {lightness: 100}
        ]
      },{
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "on" }
        ]
      },
      {
        featureType: "landscape.man_made",
        elementType: "labels",
        stylers: [
          { saturation: -20},
          { visibility: "simplified"}
        ]
      }
    ];
    map.setOptions({styles: styles});


    function triggerBLE(value) {
      console.log('triggerBLE BLE'+ value);
      BLE.sendData(myConnectedDevice.id, value);
    }

    $scope.ResetNotification = function(){
      console.log(">ResetNotification()");
      $scope.showNotification = false;
      $scope.isMsgTxt = false;
      $scope.isMsgAudio = false;
      $scope.isMsgBLE = false;
      $scope.$apply();
    };

//In charge of keeping track of user vs next notification AND trigger notifications
    function measure_Distance(){

      //distance calculated here
      var distance;
      var isaNotificationTrue = false;

      notifPos.forEach(function(value, index, array){
        if(!$scope.showNotification)
        {
          distance = google.maps.geometry.spherical.computeDistanceBetween(currPosLatLng, value);

          if (distance < $scope.inRad) {

            $scope.detectioncount++;
            isaNotificationTrue=true;
            triggeredIndex = index;
            console.log("notifications is true : "+ index);
            $scope.showNotification = true;
            myActivity.notifications[index+1].messageObject.forEach(function(value2, index2, array2){
              // $scope.currNotification += "-" + value2.type;

              //TEXT NOTIFICATION ////////////////////////////////////////////////////////////////////////////////////////////////////////////
              if ( value2.type == "text"){
                $scope.isMsgTxt = true;
                $scope.currNotification = value2.message;
              }

              //AUDIO NOTIFICATION ////////////////////////////////////////////////////////////////////////////////////////////////////////////
              else if ( value2.type == "audio"){
                $scope.isMsgAudio = true;
                var preDef;
                if(value2.format !='mp3'){
                  preDef = false;
                }else{
                  preDef = true;
                }
                console.log('playing audio notification');
                AudioServices.play(value2.filename, value2.format,preDef);
              }

              //BLE NOTIFICATION ////////////////////////////////////////////////////////////////////////////////////////////////////////////
              else if ( value2.type == "BLE"){
                $scope.isMsgBLE = true;
                $scope.currNotification += "-" + value2.name;
                //start BLE
                //triggerBLE(value2);
                BLE.sendData(myConnectedDevice.id, value2.name);
                //END BLE
              }
              //SPLIT NOTIFICATION ////////////////////////////////////////////////////////////////////////////////////////////////////////////
              else if ( value2.type == "split"){
                $scope.isMsgTxt = true;
                $scope.currNotification = "SPLIT ";
                console.log ("compare: "+Number(myActivity.notifications[index+1].metricObject[0].time) +" - "+clock);
                //calculate time difference with previous interval
                var deltaTime = Number(myActivity.notifications[index+1].metricObject[0].time) - (Number(clock)*1000);
                //start BLE
                if (deltaTime > 0 ){
                  $scope.currNotification += "faster";
                  console.log("faster");
                  //triggerBLE("111001000");
                  BLE.sendData(myConnectedDevice.id, "111001000");
                  AudioServices.play("faster", "mp3",true);
                }else{
                  $scope.currNotification += "slower";
                  console.log("slower");
                  //triggerBLE("101001000");
                  BLE.sendData(myConnectedDevice.id, "101001000");
                  AudioServices.play("fast", "mp3",true);
                }
                //END SPLIT
              }
              $timeout($scope.ResetNotification,5000);

            }); // end loop message


            $scope.$apply();
            return;

          }
          //use to remove a notification if it's on screen;
          else if(distance > $scope.exRad && $scope.showNotification && index == triggeredIndex){
            //if( $scope.showNotification == true){
            ResetNotification();
            //}
          }

        }
      });//end notifPos.forEach

    }


    //end measureDistance


    $scope.testSplitTime = function(){
      triggerBLE("141001000");
      BLE.sendData(myConnectedDevice.id, "141001000");
      AudioServices.play("alert", "mp3",true);
      console.log("testSplitTime");
      $timeout($scope.testSplitTime, 5000 );
    };
    $timeout($scope.testSplitTime, 5000 );

    //Programming equivalent to MAIN
    function wait(){
      if (!clockStopped){
        //console.log("I HATE THIS");
        //	time_1=time_1+ 0.01;
        var now = Date.now();
        clock += (now - offset);
        offset = now;
        // console.log((clock/1000)%60);
        $scope.seconds= ((clock/1000) % 60);
        $scope.minute = ((clock/60000)% 60);
        $scope.hour = ((clock/3600000) % 24);

        $scope.time = ($scope.hour < 10? "0" : "") + $scope.hour.toFixedDown(0) + ":" + ($scope.minute < 10 ? "0" : "" ) + $scope.minute.toFixedDown(0) + ":" + ($scope.seconds < 10 ? "0" : "" ) + $scope.seconds.toFixedDown(0);
        // $scope.time = clock;
        // $scope.$apply();
        // document.getElementById("time_count").innerHTML = $scope.time; //time_1.toFixedDown(2);
        // $scope.updateHTML();

        if (current_position != null)
          measure_Distance();

        myTimeout = $timeout(wait, 500); //update every 500ms
      }

      else return;
    }//End of wait


    // begin geolocation handlying -> checks for errors and responds accordingly
    if (watchProcess==null){
      watchProcess = navigator.geolocation.watchPosition(handle_geolocation_query, handle_errors, { frequency: $scope.geolocFreq, enableHighAccuracy: true, maximumAge: Infinity });
    }

    function handle_errors(error)
    {
      switch(error.code)
      {
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

    //updating user position -> commented for dev purposes only
    function handle_geolocation_query(position) {

      $scope.currentMetric = {
        coords: currPosLatLng,
        time: $scope.clock,
        lat: position.coords.lat,
        lng: position.coords.lng,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      };
      currentActivity.dataLog.push($scope.currentMetric);

      current_position=position;
      currPosLatLng = new google.maps.LatLng({lat: position.coords.latitude, lng: position.coords.longitude});

      // if (tracking==true){
      //  	tracking_data.push(current_position);
      // 	data.push(currPosLatLng);
      // }

      if(!started && !finished) {
        posMarker = new google.maps.Marker({
          position: currPosLatLng,
          map: map,
          size: new google.maps.Size(10,10),
          icon: posIcon
        });
        started = true;
      }
      else if(started) {
        posMarker.setPosition(currPosLatLng);
      }

      measure_Distance();
      // var cent = new google.maps.LatLng({lat: current_position.coords.latitude, lng: current_position.coords.longitude});
      // map.panTo(cent);
    }


    $scope.updateHTML = function() {
      if($scope.clock!=null) $scope.displayClock = UtilitiesService.convertTimeHMS($scope.clock, 3);
      if($scope.currentMetric.speed!=null) $scope.displaySpeed = $scope.currentMetric.speed.toFixed(2);
      // if($scope.currentMetric.maxspeed!=null)
      $scope.displayMaxspeed = $scope.maxspeed.toFixed(2);
      $scope.displayAveragespeed =  $scope.distance / ($scope.timeSpent /1000);//Note: timeSpent is in Ms
      if($scope.currentMetric.altitude!=null) $scope.displayAltitude = $scope.currentMetric.altitude.toFixed(2) + "m +/- " + $scope.currentMetric.altitudeAccuracy;
      if($scope.currentMetric.accuracy!=null) $scope.displayAccuracy = $scope.currentMetric.accuracy;
      if(data.length!=null) $scope.displayDataLogLength = data.length;
      if($scope.distance!=null)  $scope.displayDistance = $scope.distance.toFixed(2);
    };


    /* Handles stopping and restarting the clock */
    $scope.toggleClock = function() {
      // TEST
      $scope.showNotification = true;
      $scope.isMsgTxt = true;
      //
      console.log(">stopClock()");
      if(finished) {
        $timeout.cancel(myTimeout);
        $scope.bgLocationServices.stop();
        navigator.geolocation.clearWatch(watchProcess);
        $state.go("menu.completeActivity", {activity: myActivity, time: $scope.time})
      }
      else if(!clockStopped) {
        clockStopped = true;
        $timeout.cancel(myTimeout);
        stopButton[0].src = "img/btn_resume.png";
        // stopButton2[0].src = "img/btn_resume.png";
        return;
      }
      else if(clockStopped) {
        clockStopped = false;
        stopButton[0].src = "img/btn_stop_white.png"
        //stopButton2[0].src = "img/btn_stop_white.png"
        myTimeout = $timeout(wait, $scope.millisecondsInterval);
        offset = Date.now();

      }
    };



    if (!clockStopped) {
      clock = 0;
      offset = Date.now();
      myTimeout = $timeout(wait, $scope.millisecondsInterval);
    }
    else return;



    $scope.finish = function() {
      console.log(">finish()");
      $timeout.cancel(myTimeout);
      if($scope.bgLocationServices) $scope.bgLocationServices.stop();
      navigator.geolocation.clearWatch(watchProcess);
      $state.go("menu.completeActivity", {activity: myActivity, time: $scope.time})
    }

    /*
     * Run when the device is ready
     * Sets up background mode for receiving geolocations and giving the user notifications
     */
    document.addEventListener('deviceready', function () {
      // Get a reference to the plugin.
      var bgGeo = window.BackgroundGeolocation;

      //This callback will be executed every time a geolocation is recorded in the background.
      var callbackFn = function(location, taskId) {
        console.log('- Location: ', JSON.stringify(location));
        handle_geolocation_query(location);
        // Must signal completion of your callbackFn.
        bgGeo.finish(taskId);
      };

      // This callback will be executed if a location-error occurs.  Eg: this will be called if user disables location-services.
      var failureFn = function(errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
      };

      // Listen to location events & errors.
      bgGeo.on('location', callbackFn, failureFn);

      // Fired whenever state changes from moving->stationary or vice-versa.
      // bgGeo.on('motionchange', function(isMoving) {
      //   console.log('- onMotionChange: ', isMoving);
      // });

      // BackgroundGeoLocation is highly configurable.
      bgGeo.configure(SettingService.bgLocationSettings, function(state) {
        // This callback is executed when the plugin is ready to use.
        console.log('BackgroundGeolocation ready: ', state);
        if (!state.enabled) {
          bgGeo.start();
        }
      });

      // The plugin is typically toggled with some button on your UI.
      bgGeo.start();

    });

    $scope.goBack = function() {
      //$ionicSideMenuDelegate.canDragContent(true);
      $ionicHistory.goBack();
    };

    $scope.endActivity = function() {
      $scope.toggleClock();
      if($scope.bgLocationServices)$scope.bgLocationServices.stop();
      navigator.geolocation.clearWatch(watchProcess);
      $ionicSideMenuDelegate.canDragContent(true);
      $rootScope.hideTabs = false;
      $ionicHistory.goBack();
    }


    $scope.$on('GetNotifEvent', function (event, data) {
      console.log(">GetNotifEvent() from BLE");
      if (data.value == "TAG") {
        if ($scope.substate == 1) {

          if ($scope.substate == 1) {
            $scope.substate = 2;
            clock = 0;
            myTimeout = $timeout(wait, $scope.millisecondsInterval);
            offset = Date.now();
            clockStopped = false;
            $scope.apply();
          }else{
            //stop timer
            $scope.clockStopped();
          }
          BLE.sendData(myConnectedDevice.id, "111001000");
          AudioServices.play("start", "mp3", true);
        }
      }
    });
  })
}) ();
