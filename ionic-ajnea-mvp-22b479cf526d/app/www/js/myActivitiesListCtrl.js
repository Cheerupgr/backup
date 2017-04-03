( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........
angular.module('controllers').controller('myActivitiesListCtrl', function($scope, $ionicPopover, $state, $ionicHistory, $translate, $ionicLoading, UserService, ActivityService, PopupService, UtilitiesService, SettingService) {
  UtilitiesService.log("*ENTERPAGE", "MyActivitiesList");
	// Spinner when getting decks
$scope.side_menu.style.visibility = "visible"
  var mySettings = SettingService.getSettings();
  $scope.unit = SettingService.getUnit();
	$scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
  UtilitiesService.log("SETTINGS", "settings: "+ $scope.unit );

  $scope.AllActivities = 	UserService.getActivities();

  //TODO: remove all this leagcy of decks and make sure we are getting activities
  $scope.convertSec=UtilitiesService.convertTime;

  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var output = "";

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if(hours!="00") output = hours;
    if(minutes!="00") output += minutes;
    if(seconds!="00") output += seconds;
    return output;
  };

  $scope.gettingDecks = true;
	// User's decks
	$scope.myDecks = [];
	// Variable to know which tab we are
	$scope.myDecksTabsActivated = true;

	// Initialization
	//ActivityService.reset();
	// ActivityService.getActivitiesDatabase(function() {
	// 	// Done
	// 	$scope.gettingDecks = false;
	// });


	// Refresh after one seconde if we are in offline mode
	if (UserService.getOfflineMode() == true) {
		setTimeout(function(){
			ActivityService.getActivitiesDatabase(function() { $scope.gettingDecks = false; });
		}, 1000);
	}

	// Get the number of unseen cards
	$scope.numberUnseenCards = function(deck) {
		return ActivityService.getNbUnseenCards(deck);
	};

	// Get hte user's activities
	$scope.getActivities = function() {
		return UserService.getActivities();
	};

	// // Get the user's deck(s)
	// $scope.getDecks = function() {
	// 	return UserService.getDecks();
	// };

	// Get the user's owned deck(s)
	$scope.getOwnedDecks = function() {
		return ActivityService.getNotMineOwnedDecks();
	};

	// Redirect to preview an activity
	$scope.previewActivity = function(activity) {
		$ionicHistory.nextViewOptions({
            disableBack: false
      	});
		$state.go("menu.previewActivity", { activity: activity });
	};

	$scope.playActivity = function(activity){
		UtilitiesService.log("PLAYACTIVITY", 'playing this activity');
		$ionicHistory.nextViewOptions({
            disableBack: false
      	});
		$state.go("menu.playActivity", {activity: activity});
	};
	// Ask the user if he wants to delete the deck
	$scope.deleteActivity = function(activity) {
		PopupService.showConfirm($translate.instant('MYDECKS.Delete-deck'), $translate.instant('MYDECKS.Sure-delete-deck'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				ActivityService.removeActivity(activity, UserService.getEmail(),
          function(activities) {
					$ionicLoading.hide();
            // $scope.$apply(
            //   function () {

            $scope.AllActivities=[];
            $scope.AllActivities = Array.from(activities);
            // });
				  },
          function() {
					// Hide the loading screen
					$ionicLoading.hide();
				  }
				);
			}
		);
	};

	$scope.refresh = function(){
		//ActivityService.reset();//TODO this refresh should get the  user new activities
		ActivityService.getActivitiesDatabase(function() {
			//done

			$scope.$broadcast('scroll.refreshComplete')
		});
	};

	// Get the popover template
	// $ionicPopover.fromTemplateUrl('myDecksPopover.html', {
	// 	scope: $scope
	// }).then(function(popover) {
	// 	$scope.popover = popover;
	// });
	// $scope.openPopover = function($event) {
	// 	$scope.popover.show($event);
	// };
	// $scope.closePopover = function() {
	// 	$scope.popover.hide();
	// };
	// $scope.goToMarket = function() {
	// 	$state.go("menu.marketplace");
	// };
	// $scope.refreshDecks = function() {
	// 	$scope.gettingDecks = true;
	// 	// Resfresh the decks
	// 	ActivityService.reset();
	// 	ActivityService.getDecksDatabase(function() {
	// 		// Done
	// 		$scope.gettingDecks = false;
	// 	});
	// 	// Close the popover
	// 	$scope.popover.hide();
	// };
	// //Cleanup the popover when we're done with it!
	// $scope.$on('$destroy', function() {
	// 	$scope.popover.remove();
	// });
});

}) ();
