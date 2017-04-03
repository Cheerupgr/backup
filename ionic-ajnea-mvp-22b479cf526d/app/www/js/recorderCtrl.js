( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........
angular.module('controllers').controller('RecorderCtrl', function($scope, $stateParams, $state, $ionicLoading, $translate, $ionicHistory, $sce, $timeout, UserService, PopupService, ActivityService, CardService) {

	$scope.currentCard = ActivityService.newCard();
	$scope.substate=1;

	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = TagService.newSearch();
	// We get the type of cards
	$scope.cardTypes = CardService.getCardTypes();
	// Contains the HTML code for the answer (Fill in the blank mode only)
	$scope.htmlAnswer = "<span></span>";
	$scope.blanksValues = new Array();

	// We get the deck sent in parameter (we will add the card in that deck)
	$scope.currentDeck = $stateParams.deck;
	// We get the boolean to know if we are creating a new deck along with the card
	$scope.creatingDeck = $stateParams.creatingDeck
	// Check we successfully got the boolean
	if ($scope.creatingDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Error-occurred'));
		// Make the next page the root history
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("menu.myDecks");
	}
	// Check we successfully got the deck
	if ($scope.currentDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		// Redirect to the good state
		if ($scope.creatingDeck)
			$state.go("menu.createDeck");
		else {
			// Make the next page the root history
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go("menu.myDecks");
		}
		return;
	}
	// If we have an ID field in the deck, use the ActivityService to update the deck
	if ($scope.currentDeck._id != undefined) {
		var updatedDeck = ActivityService.getDeckWithId($scope.currentDeck._id);
		if (updatedDeck != null)
			$scope.currentDeck = updatedDeck;
	}

	// Create the deck with the card in it
	$scope.createCard = function() {
		if ($scope.currentCard.type.value == "Fill in the blank")
			reformAnswerFromBlanks();
		if ($scope.currentCard.question.length > 0 && $scope.currentCard.answer.length > 0) {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
			if ($scope.creatingDeck) {
				// Add the deck in our list of decks (we send a copy)
				var newDeck = ActivityService.addDeck(UserService.getEmail(), _.extend({}, $scope.currentDeck));
				// When the ActivityService has created the deck, we can add the card
				$scope.createDeck.promise.then(function() {
					// If we cannot added the new deck, we display an error and return
					if (newDeck._id == undefined) {
						// Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-occurred'));
						return;
					}
					// Else, we keep going
					$scope.currentDeck = newDeck;
					// Add the card in the deck
					$scope.currentDeck = ActivityService.addCard($scope.currentCard, $scope.currentDeck);
					// Reset data form
					$scope.currentCard = ActivityService.newCard();
					$scope.search = TagService.newSearch();
					// Hide the loading screen
					$ionicLoading.hide();
					// Make the next page the root history
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("menu.myDecks");
				});
			}
			else {
				// Add the card in the deck
				$scope.currentDeck = ActivityService.addCard($scope.currentCard, $scope.currentDeck);
				// Reset data form
				$scope.currentCard = ActivityService.newCard();
				$scope.search = TagService.newSearch();
				// Hide the loading screen
				$ionicLoading.hide();
				// Redirect
				$state.go("menu.displayDeck", { deck: $scope.currentDeck, isBoughtDeck: false });
			}
		}
		else
			PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-fields'));
	};

	// Add a blank to the question (Fill in the blank mode only)
	$scope.addBlankToQuestion = function() {
		// We get our input for the question
		var input = angular.element(document.getElementById('questionInput'));

		if (input == undefined)
			return;
		// Find where the cursor is
		var caretPos = input[0].selectionStart;
		if (caretPos == undefined)
			return;
		var text = input[0].value;
		// We create our blank text, and an int to know how many we need to move forward the cursor
		var moveCursor = 4;
		var blankText = "";
		// and we add a space before the blank if the user didn't put one
		if (caretPos > 0 && text[caretPos - 1] != ' ') {
			blankText = " ";
			moveCursor = moveCursor + 1;
		}
		blankText += "[..]";
		// Add a space after the blank if the user didn't put one
		if (text[caretPos] == undefined || text[caretPos] != ' ') {
			blankText += " ";
			moveCursor = moveCursor + 1;
		}
		// Add our blank
		input[0].value = text.substring(0, caretPos) + blankText + text.substring(caretPos);
		// Trigger the change event to force the UI to update, and put back the selection cursor
		input.triggerHandler('change');
		$timeout(function() {
			input[0].setSelectionRange(caretPos + moveCursor, caretPos + moveCursor);
			input[0].focus();
		});
	}

	// Save the value of the blank passed in parameter (use the index to identify which blank)
	$scope.saveBlankValue = function(index, element) {
		$scope.blanksValues[index] = element.value;
	};


		var track_id = '';      // Name/ID of the exercise
		var watch_id = null;    // ID of the geolocation
		var tracking_data = []; // Array containing GPS position objects
		var data= [];
		var tag= [];
		var tagFlag=false;
		var current_position;
		var tracking=false;
		var map;
		var time_1=0.0;

		var myOptions = {
	      		zoom: 20,
	      		mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
	   	 };
	    	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);


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


	$scope.goToTracking = function(){
		$scope.substate=2;
		tracking=true;

     		tracking_data.push(current_position);
		data.push(new google.maps.LatLng({lat: tracking_data[tracking_data.length-1].coords.latitude, lng: tracking_data[tracking_data.length-1].coords.longitude}));
		$scope.currentCard.data=data;
		if($scope.currentCard.data.length==1){
			setStartingMarker();
		}


	function wait(){
		if (tracking==true){
			time_1=time_1+.01;
			setTimeout(wait,10);
			document.getElementById("pos_count").innerHTML =  time_1.toFixedDown(2);
		}else{
		return;
		}
	}
	if (tracking==true){
	wait();
	}else{
	return;
	}
	}

	Number.prototype.toFixedDown = function(digits) {
	    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
		m = this.toString().match(re);
	    return m ? parseFloat(m[1]) : this.valueOf();
	};

	setStartingMarker = function(){

		var image = {
    		url: 'img/markerlabel_start.png',
  		  // This marker is 20 pixels wide by 32 pixels high.
   		 size: new google.maps.Size(28, 38),
   		 // The origin for this image is (0, 0).
		origin: new google.maps.Point(0, 0),
   		 // The anchor for this image is the base of the flagpole at (0, 32).
   		 anchor: new google.maps.Point(14, 38)
  		};

		var start_marker = new google.maps.Marker({
		  position: $scope.currentCard.data[0],
		  map: map,
		  size: new google.maps.Size(10, 10),
		  icon: image
		});
	}

	setTrackPath = function(){
		var trackPath = new google.maps.Polyline({
		path: $scope.currentCard.data,
		strokeColor: "#FFA500",
		strokeOpacity: 0.8,
		strokeWeight: 5
		});

		trackPath.setMap(map);
	}




	var watchProcess=null;

	if (watchProcess==null){
        	watchProcess = navigator.geolocation.watchPosition(handle_geolocation_query, handle_errors, { frequency: 1000, enableHighAccuracy: true, maximumAge: Infinity });
	}

        function handle_errors(error)
        {
            switch(error.code)
            {
                case error.PERMISSION_DENIED: alert("user did not share geolocation data");
                break;
                case error.POSITION_UNAVAILABLE: alert("could not detect current position");
                break;
                case error.TIMEOUT: alert("retrieving position timedout");
                break;
                default: alert("unknown error");
                break;
            }
        }

	function handle_geolocation_query(position) {

		current_position=position;
		if (tracking==true){
	     		tracking_data.push(current_position);
			data.push(new google.maps.LatLng({lat: tracking_data[tracking_data.length-1].coords.latitude, lng: tracking_data[tracking_data.length-1].coords.longitude}));
			$scope.currentCard.data=data;
			setTrackPath();
		}
 				var cent = new google.maps.LatLng({lat: current_position.coords.latitude, lng: current_position.coords.longitude});
				map.panTo(cent);
	}

	$scope.track_stop = function(){
		tracking=false;
	};

	$scope.tag = function(){
		var image2 = {
    		url: 'img/markerlabel_1.png',
  		  // This marker is 20 pixels wide by 32 pixels high.
   		 size: new google.maps.Size(28, 38),
   		 // The origin for this image is (0, 0).
		origin: new google.maps.Point(0, 0),
   		 // The anchor for this image is the base of the flagpole at (0, 32).
   		 anchor: new google.maps.Point(14, 38)
  		};

		var leg_1_marker = new google.maps.Marker({
		  position: $scope.currentCard.data[data.length-1],
		  map: map,
		  size: new google.maps.Size(10, 10),
		  icon: image2
		});
	};

	$scope.show_map = function(){
		var myLatLng = new google.maps.LatLng({lat: tracking_data[tracking_data.length-1].coords.latitude, lng: tracking_data[tracking_data.length-1].coords.longitude});
		var myOptions = {
	      		zoom: 20,
	      		center: myLatLng,
	      		mapTypeId: google.maps.MapTypeId.ROADMAP
	   	 };

		var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		var trackCoords = [];
		for(i=0; i<tracking_data.length; i++){
			trackCoords.push(new google.maps.LatLng(tracking_data[i].coords.latitude, tracking_data[i].coords.longitude));
		}
		var trackPath = new google.maps.Polyline({
			path: data,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2
	});
		trackPath.setMap(map);
		$scope.currentCard.data=data;
	}

	$scope.finish = function() {
		$scope.currentCard.answer="null";
		$scope.currentCard.question="null";
		if ($scope.currentCard.type.value == "Fill in the blank")
				reformAnswerFromBlanks();
		if ($scope.currentCard.question.length > 0 && $scope.currentCard.answer.length > 0) {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
			if ($scope.creatingDeck) {
				// Add the deck in our list of decks (we send a copy)
				var newDeck = ActivityService.addDeck(UserService.getEmail(), _.extend({}, $scope.currentDeck));
				// When the ActivityService has created the deck, we can add the card
				$scope.createDeck.promise.then(function() {
					// If we cannot added the new deck, we display an error and return
					if (newDeck._id == undefined) {
						// Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-occurred'));
						return;
					}
					// Else, we keep going
					$scope.currentDeck = newDeck;
					// Add the card in the deck
					$scope.currentDeck = ActivityService.addCard($scope.currentCard, $scope.currentDeck);
					// Reset data form
					$scope.currentCard = ActivityService.newCard();
					$scope.search = TagService.newSearch();
					// Hide the loading screen
					$ionicLoading.hide();
					// Make the next page the root history
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("menu.myDecks");
				});
			}
			else {
				// Add the card in the deck
				$scope.currentDeck = ActivityService.addCard($scope.currentCard, $scope.currentDeck);
				// Reset data form
				$scope.currentCard = ActivityService.newCard();
				$scope.search = TagService.newSearch();
				// Hide the loading screen
				$ionicLoading.hide();
				// Redirect
				$state.go("menu.displayDeck", { deck: $scope.currentDeck, isBoughtDeck: false });
			}
		}
		else
			PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-fields'));
	};
});

}) ();
