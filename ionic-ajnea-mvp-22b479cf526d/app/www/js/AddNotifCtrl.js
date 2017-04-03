( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........

angular.module('controllers').controller('AddNotifCtrl', function($scope, $rootScope, $ionicHistory, $state, $ionicSlideBoxDelegate, UserService, SettingService,  $translate, $stateParams, BLE, PopupService, ActivityService, $ionicSideMenuDelegate, AudioServices, UtilitiesService, MapService) {

     $ionicSlideBoxDelegate.enableSlide(false);
     $ionicSideMenuDelegate.canDragContent(false);



    //This is your activity variable whose properties you can manipulate

    var myActivity;

        //Checking to see if the Activity Object has been initialized,  if not then it creates a new one otherwise just get reference to global object in use.
    if(typeof ActivityService.importActivity() == 'undefined'){
        //console.log('inside if');
        myActivity = ActivityService.newActivity();
    }else{
        myActivity = ActivityService.importActivity();
        // console.log("In the else condition: ", myActivity);
        }//end of myactivity else

    console.dir(myActivity);

        //The notification data
    var currNotification = {
            metricObject: [],
            messageObject:[]
    };

  $scope.devices = BLE.devices;
  $scope.myConnectedDevice = null;


  $scope.connecting = function(device){
    $scope.bluetoothDevice = device;
    BLE.connect(device.id);
  };

    //Default Metric we are measuring against.
    var GPS = {
        type: "gps",
        lat: Number($stateParams.myLat),
        lng: Number($stateParams.myLng),
        altitude: Number($stateParams.metrics.altitude),
        speed: Number($stateParams.metrics.speed),
        time: (Math.round(Number($stateParams.myTime)*100)/100),
        timestamp: Math.round(Number($stateParams.metrics.timestamp))
    };

    $scope.myTime = $stateParams.myTime;
    $scope.textOption = "";


    $scope.customAudio = {result:false, filename:''};

    $scope.updateText = function(textInput){
        //console.log('textInput: ' + textInput + ' textOption: ' + $scope.textOption);
        $scope.textOption = textInput;

    }//end of updateText

    $scope.updateCustomAudio = function(result){
        if(result != null && result != 'undefined'){
            $scope.customAudio.result = true;
            $scope.customAudio.filename = result;
        }
        else{
            $scope.customAudio.result = false;
        }
    }


    //adding the metricObject into the notification object.
    currNotification.metricObject.push(GPS);

    // Used to remove the slide bounce when on the first and last slide
	$scope.myActiveSlide = -1;

    $scope.allNotificationTypes = [
      {"name":"NOTIFICATIONS.Text", "id":0 ,"isSelected":0}, {"name":"NOTIFICATIONS.Audio", "id":1, "isSelected":0},
      {"name":"NOTIFICATIONS.Display", "id":2,"isSelected":0 }, {"name":"NOTIFICATIONS.Split-time", "id":3,"isSelected":0 }];

    $scope.AudioNotification = AudioServices.getAudioSync();

    $scope.LEDNotification =  [
      {"label":"NOTIFICATIONS.LED-none", "id":0 ,"name":"0"},
      {"label":"NOTIFICATIONS.LED-Red", "id":1,"name":"100005000" },
      {"label":"NOTIFICATIONS.LED-Green", "id":2 ,"name":"110005000"},
      {"label":"NOTIFICATIONS.LED-Oange", "id":3 ,"name":"154005000"}, {"label":"NOTIFICATIONS.LED-Blue", "id":4,"name":"120005000" }];

    $scope.slideHasChanged = function(index){
        $scope.slideIndex = index;
    };

    // Swipe to the next page
	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	};

    $scope.prevSlide = function() {
		$ionicSlideBoxDelegate.previous();
	};

    	// Used to remove the slide bounce when on the first and last slide
	$scope.enableSlide = function() {
		$ionicSlideBoxDelegate.enableSlide(true);
	};


    $scope.chooseText = function() {
        textOption = $scope.currNotification.text;
    };

    $scope.createNotification = function(notificationType, myId){
        switch(notificationType){

            //text
            case 0:
                currNotification.messageObject.push({type:'text', message: $scope.textOption});
                break;

            //audio
            case 1:
                //if there is no customAudio selected
                if(!$scope.customAudio.result){
                currNotification.messageObject.push({type:'audio', id: myId, format: $scope.AudioNotification[myId].format, filename: $scope.AudioNotification[myId].name });
                }else{
                    var auxID = Date.now() + $stateParams.myTagId;
                    var auxFileData = ($scope.customAudio.filename).split(".");
                    currNotification.messageObject.push({type:'audio', id:auxID, format:auxFileData[1], filename:auxFileData[0]});
                    console.dir(currNotification.messageObject);
                }
                break;

            //BLE
            case 2:
                currNotification.messageObject.push({type:'BLE', id: myId, name: $scope.LEDNotification[myId].name });
                break;
          case 3:
            console.log("This is myActivity inside of createNotification: ", myActivity);
            currNotification.messageObject.push({type:'split', id: myId, name:UtilitiesService.getNotifName(myActivity.notifications,"split","radio"),message: Math.round($stateParams.myTime) });
            break;

        }//end of switch
    }; //end of createNotification

    $scope.submitNotification = function(){

      console.log(">submitNotification");
        var tagFlag = false;

        $scope.allNotificationTypes.forEach(function(element, index, array){
            if(element.isSelected !=0){
                tagFlag = true;
                // Create a notification of the selected element type, use the id to determine what type of notification
                $scope.createNotification(element.id, element.isSelected);
                // console.log("In submitNotification 1st conditional statement");
            }//if isSelected
        });
        //if atleast 1 type of notification was chosen, then save it into the current activity
        if(tagFlag){
            // console.log("In submitNotification 2nd conditional statement");
            //console.dir(currNotification);
            myActivity.notifications.push(currNotification);
        }//if
       // window.localStorage.setItem("isClockStartRequest", true);

       //mark the notification position on the map
      var map = MapService.getMap("map_canvas");
       var notMarker =
         map.addMarker({
         'position': new plugin.google.maps.LatLng($stateParams.myLat, $stateParams.myLng)
       }, function(marker) {
         marker.setIcon({
           'url': 'img/gps_tag.png',
           'size': {
             width: 20,
             height: 32
           }
         });
       });
        $rootScope.isClockStartRequest = true;

        $state.go("menu.CreateActivity");

	};//end of submitNotification

    //this back button will be active for slide 1 only
    $scope.back_button = function(){

            //The user did choose at least 1 type of notification, so the notification is saved.
        if(currNotification.metricObject.length > 0 && currNotification.messageObject.length > 0){
            console.log('saving notification object');
            console.dir(currNotification);
        } else{
        //if the user did not save any type of notification, then this notification is discarded and nothing is saved
            console.log('discarding notification object');
            console.dir(currNotification);
        }
      window.localStorage.setItem("isClockStartRequest", true);
      $state.go("menu.CreateActivity");
    }//end of back_button

    //This back button will be active for Slide 2 only
    $scope.back_button2 = function(){

        //Safety in case user double clicks the button quicker than UI response
        if($scope.myActiveSlide < 0){
          window.localStorage.setItem("isClockStartRequest", true);
            $state.go("menu.CreateActivity");
            }

        switch($scope.myActiveSlide){
            //When Text form is active
            case 0:
                console.log('back_button2 pressed for text');
                //$scope.inputNotification(0,0);
                break;

            //When Audio form is active
            case 1:
                console.log('back_button2 pressed for audio');
                //console.dir(currNotification);
                break;

            //When Wearable form is active
            case 2:
                console.log('back_button2 pressed for Bluetooth');
                //console.dir(currNotification);
                break;

            //The Default behaviors is to provide text notification -> same as case 0:
            default:
                break;
        }//end of switch case

        $scope.myActiveSlide = -1;
        $scope.prevSlide();
    }//end of back_button2

    $scope.inputNotificationType = function(id){
        console.log('input id: '+ id+ ' value of activeSlide: ' + $scope.myActiveSlide);
        $scope.myActiveSlide = id;
        $scope.nextSlide();


    }//endo of inputNotification

    $scope.myGoBack = function() {
      if ($scope.myActiveSlide !=-1){
        console.log("back activeSlide");
        $scope.myActiveSlide =-1;
        $scope.prevSlide();
    }else {
          console.log("back page");
          window.localStorage.setItem("isClockStartRequest", true);
          $state.go("menu.CreateActivity",{createMarker:false, position:null});

          }
        }

    $scope.inputNotification = function(type,id){

        switch(type){

            //case Text
            case 0:
                if($scope.textOption != 'undefined' && $scope.textOption != ''){
                    $scope.allNotificationTypes[0].isSelected=1;
                }//end of inner if
                else{
                    $scope.allNotificationTypes[0].isSelected=0;
                }
                break;

            //case Audio
            case 1:
                $scope.allNotificationTypes[type].isSelected=id;
                if(id>1){
                    console.log('playing audio');
                    var preDefined = true;
                    AudioServices.play($scope.AudioNotification[id].name, $scope.AudioNotification[id].format, preDefined);
                    $scope.customAudio.result = false;
                } else if(id < 1){
                    console.log('record audio option -> none');
                    $scope.customAudio.result = false;
                }else{
                    console.log("else start of record audio");
                    AudioServices.startRecording(Date.now(), $stateParams.myTagId, $scope.updateCustomAudio);

                }
                break;

            //case BLE
            case 2:
                $scope.allNotificationTypes[type].isSelected=id;
                console.log('ble: '+$scope.LEDNotification[id].name);
                if(SettingService.isMobile()){
                  BLE.sendData(myConnectedDevice.id, $scope.LEDNotification[id].name);
                }
                break;

          case 3:
            $scope.allNotificationTypes[type].isSelected=id;
            break;
            default:
                break;

            }//end of switch


       $scope.back_button2();


    }//end of inputNotification



});

}) ();
