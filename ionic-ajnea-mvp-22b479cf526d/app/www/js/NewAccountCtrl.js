( function() {

angular.module('controllers').controller('NewAccountCtrl', function($scope, $state, $translate, $ionicLoading, UserService, PopupService, UtilitiesService) {
	UtilitiesService.log("*ENTERPAGE", "NewAccount");
	// Variable to temporarily store the user's data
	$scope.accountData = {};


		successFct = function(response) {
			UtilitiesService.log("DEBUG", "getActivityTypeList success");
			console.dir(response.data.list);
			$scope.preferredActivityTypeList =response.data.list;
			activityTypeList = response.data.list;
		};
		errorFct = function(response) {
			UtilitiesService.log("ERROR", "getActivityTypeList fail");
			$scope.preferredActivityTypeList = [
				{name : "Road Cycling"},
				{name : "Mountain Biking"},
				{name : "Running"},
				{name : "Skiing"},
				{name : "Snowboarding"}]; // default values
		};
 UserService.getActivityTypeList(successFct, errorFct); //get values from uservice


	// This function checks all the fields and returns 0 if everything is correct, else returns an error code
	checkAccoutFields = function() {
		// One of the fields is empty
		if (!$scope.accountData.username || $scope.accountData.username.length <= 0 ||
			!$scope.accountData.email || $scope.accountData.email.length <= 0 ||
			!$scope.accountData.password || $scope.accountData.password.length <= 0)
			return 1;

		// Email address is not well formated
		var patt = /\S+@\S+\.\S+/;
		if (patt.test($scope.accountData.email) == false)
			return 2;

		return 0;
	};

	// Create a new account
	$scope.createAccount = function() {
		// Check all the fields, then use the return code to execute the good actions
		switch (checkAccoutFields()) {

			// Everything is correct, we can try to create the account but still check if email address not already used
			case 0:
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('NEWACCOUNT.Creating') + ' ...' });
				UtilitiesService.log("CREATEACCOUNT", "createAccount :"+ $scope.accountData );
				console.dir($scope.accountData);
				// Convert weight units to kgs when saved in database
				if ($scope.accountData.profile.weightUnit == "lbs") {
					UtilitiesService.log("CREATEACCOUNT", "weightConversion : from lbs to kgs");
					$scope.accountData.profile.weight = Math.round($scope.accountData.profile.weight * 0.453592);
					$scope.accountData.profile.weightUnit = "kgs";
				}
				// Add preferred activity dropdown




				// Try to create an account
				UserService.createAccount($scope.accountData, function(response) {
					// Success
					$scope.accountData = {};
					// Hide the loading screen
					$ionicLoading.hide();
					// Redirect
					$state.go("login");
					PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
				}, function(response) {
					// Fail
					// Hide the loading screen
					$ionicLoading.hide();
					if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
						PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
				});
				break;

			// One field is empty
			case 1:
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Error-fields'));
				break;

			// Email address is not well formated
			case 2:
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Email-incorrect'));
				break;

			default:
		}
	};
});

}) ();
