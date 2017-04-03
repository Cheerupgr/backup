( function() {

	angular.module('controllers').controller('MenuCtrl', function($scope, $state, $ionicHistory, $rootScope, UserService, UtilitiesService) {
		UtilitiesService.log("*ENTERPAGE", "Menu");
  $rootScope.hideTabs = false;
	UtilitiesService.log("ACTION", "MENU CONTROL");

	$scope.offlineMode = UserService.getOfflineMode();

	$scope.getUsername = function() {
		return UserService.getUsername();
	};
	$scope.getEmail = function() {
		return UserService.getEmail();
	};
    // to solve the side-menu overlap we turned it into hidden and need to make it visible here

    $rootScope.side_menu = document.getElementsByTagName("ion-side-menu")[0];
	/*
	// Redirect to "My decks" page
	$scope.goToMyDecks = function() {
		$state.go("menu.myDecks");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};

	// Redirect to "Deckstore" page
	$scope.goToDeckstore = function() {
		$state.go("menu.deckstore");
	};

	// Redirect to "My account" page
	$scope.goToMyAccount = function() {
		$state.go("menu.myAccount");
	};

	*/

    $scope.goToHomePage = function() {
			UtilitiesService.log("ACTION", "go to home page");
      $state.go("menu.CreateActivity");
    };
    $scope.goToMyAccount = function() {
      $state.go("menu.myAccount");
    };
    $scope.goToMySettings = function() {
      UtilitiesService.log("ACTION", "go to settings ");
      $state.go("menu.settings");
    };
		$scope.goToInviteFriend = function() {
      UtilitiesService.log("ACTION", "go to inviteFriend ");
      $state.go("menu.inviteFriend");
    };
		$scope.goToReportBug = function() {
      UtilitiesService.log("ACTION", "go to reportBug ");
      $state.go("menu.reportBug");
    };


		$scope.rateApp = function() {
	   var alertPopup = $ionicPopup.alert({
	     title: 'Rate This App!',
	     template: 'It might taste good'
	   });
	 	};

    // Disconnect the user
    $scope.logout = function() {
      //UserService.disconnect();
      localStorage.clear();
      $state.go("login");
    };

    $scope.about = function() {
      //UserService.disconnect();
      $state.go("menu.about");
    };

    $scope.bluetooth = function() {

      $state.go("menu.bleConnect");
      UtilitiesService.log("ACTION", "go to bleConnect page");
    };

		$scope.clearHistory = function() {
			$ionicHistory.clearHistory();
		}

		$scope.hideTabs = function() {
			if ($rootScope.hideTabs)
				return "tabs-item-hide";
			else
				return "";
		}





	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();
		localStorage.clear();
		$state.go("login");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};
});

}) ();
