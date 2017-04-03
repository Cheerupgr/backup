( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........

angular.module('controllers').controller('MyAccountCtrl', function($scope, $state, $ionicHistory, UserService, ActivityService, UtilitiesService) {
	UtilitiesService.log("*ENTERPAGE", "MyAccount");
	// ActivityService.getInformationsDecks(function(){}, function() {
	// 	// Fail
	// 	$state.go("menu.myDecks");
	// 	$ionicHistory.nextViewOptions({
	// 		historyRoot: true
	// 	});
	// });

	$scope.getUsername = function() {
		return UserService.getUsername();
	};
	$scope.getEmail = function() {
		return UserService.getEmail();
	};



	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();
		localStorage.clear();
		$state.go("login");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};

	// Called when the user click the "connect with Paypal" button
	$scope.connectPaypal = function() {

	};
});

}) ();
