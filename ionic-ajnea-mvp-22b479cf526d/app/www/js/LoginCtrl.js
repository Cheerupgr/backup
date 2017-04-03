(function() {
//controller code goes in here with syntax : "angular.module('controllers').controller........
angular.module('controllers').controller('LoginCtrl', function($scope, $state,$ionicModal, localStorageService,$translate, $ionicHistory, $ionicLoading, $ionicPlatform, $cordovaOauth, $http, UserService, PopupService, ActivityService, UtilitiesService) {
	UtilitiesService.log("*ENTERPAGE", "LogIn");

	// The user's login data
	$scope.loginData = {};

	// This function checks all the fields and returns 0 if everything is correct, else returns an error code
	checkLoginFields = function() {
		// One of the fields is empty
		if (!$scope.loginData.email || $scope.loginData.email.length <= 0 ||
			!$scope.loginData.password || $scope.loginData.password.length <= 0)
			return 1;
		return 0;
	};

	// Function loaded when the user is connected
	$scope.userConnected = function() {
		// Reset the fields
		$scope.loginData = {};
		// Make the next page the root history
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		// Hide the loading screen
		$ionicLoading.hide();
		// Redirect to 'NEW HOMEPAGE SIMILAR TO SNAPCHAT' page
		$state.go("menu.CreateActivity");
	};

	$scope.goToBleTest = function() {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$ionicLoading.hide();
		$state.go("bleTest");
		UtilitiesService.log("BLECONNECT", "go to bleTest page");
	};

	// Function loaded if we could not connect the user, and we have to display an error
	$scope.userNotConnected = function(response) {
		// Hide the loading screen
		$ionicLoading.hide();
		// Display a popup
		if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
			PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
		else
			PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
	}

	// Perform the login action when the user submits the login form
	$scope.login = function() {
		// Check all the fields, then use the return code to execute the good actions
		$scope.loginData.email=$scope.loginData.email || null;
		$scope.loginData.password=$scope.loginData.password || null;
		switch (checkLoginFields()) {

			// Everything is correct, we can try to connect but still check for an error
			case 0:
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
				UserService.connect($scope.loginData, function(response) {
					// Success
					localStorage.setItem('userdata',JSON.stringify($scope.loginData));
		          	console.dir ($scope.loginData);
					$scope.userConnected();
				}, function(response) {
					// Fail
					$scope.userNotConnected(response);
				});
				break;

			// An error happened
			case 1:
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Error-fields'));
				break;

			default:
		}
	};

	// Perform a Facebook login
	$scope.loginFacebook = function() {
		if (typeof facebookConnectPlugin !== 'undefined') {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
			facebookConnectPlugin.login(["email"], function(res) {
				// Success
				if (res.authResponse && res.authResponse.userID) {
					facebookConnectPlugin.api('/me?fields=id,name,email', null,
						function(response) {
							if (response.email && response.name) {
								// We have everything we need to connect / create the user
								UserService.connectSocialMedia({ email: response.email, name: response.name, id: res.authResponse.userID, socialMedia: 'facebook' }, function(response2) {
									// Success
									$scope.userConnected();
								}, function(response2) {
									// Fail
									$scope.userNotConnected(response2);
								});
							}
							else {
								// Hide the loading screen
								$ionicLoading.hide();
								PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
							}
						}
					);
				}
				else {
					// Hide the loading screen
					$ionicLoading.hide();
					PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
				}
			}, function(res) {
				// Fail
				// Hide the loading screen
				$ionicLoading.hide();
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
			});
		}
	};

	$scope.loginGoogle = function() {
		UtilitiesService.log("LOGIN", "loginGoogle");
		$ionicPlatform.ready(function() {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
			$cordovaOauth.google("1089116189269-frvmssobgt8bl0uqel3her19ek5hpfg2.apps.googleusercontent.com", ["https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {
	            // Success
				$http.get('https://www.googleapis.com/oauth2/v2/userinfo?fields=id,email,name&access_token=' + result.access_token).then(
					function(response) {
						// Success
						if (response && response.data && response.data.email && response.data.id) {
							// We have everything we need to connect / create the user
							UserService.connectSocialMedia({ email: response.data.email, name: response.data.name, id: response.data.id, socialMedia: 'google' }, function(response2) {
								// Success
								$scope.userConnected();
							}, function(response2) {
								// Fail
								$scope.userNotConnected(response2);
							});
						}
						else {
							// Hide the loading screen
							$ionicLoading.hide();
							PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
						}
					}, function(response) {
						// Fail
			            // Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
					}
				);
	        }, function(error) {
	            // Fail
	            // Hide the loading screen
				$ionicLoading.hide();
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant("cordova fails"));
	        });
		});
	};

	$scope.loginTwitter = function() {

		$ionicPlatform.ready(function() {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
			$cordovaOauth.twitter("o8qBj8kAyUGQfqLA9Y1f1efDr", "qUwK5QQcd4CMSVvnNCOS6LBR8Ye4T11aN5AiYzjvNIYbIJTHGP").then(function(result) {
	            // Success
	            // Hide the loading screen
				$ionicLoading.hide();
				alert(JSON.stringify(result));
	        }, function(error) {
	            // Fail
	            // Hide the loading screen
				$ionicLoading.hide();
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
	        });
		});
	};

	////////////////
	// strava sign in
	$scope.loginStrava = function() {

		$ionicPlatform.ready(function() {
			// Display a loading screen
      //response_type:code, redirect_uri:'http://localhost', approval_prompt:force
			$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
			$cordovaOauth.strava('14462', '31dfaef16011313f7eb571ab43314a539a68eab4', ['write']).then(
			  function(result) {
							// Success
          UtilitiesService.log("DEBUG", "$cordovaOauth.strava success");

          var data = JSON.stringify(result);

          console.log("data "+ data);
          UserService.connectwithStrava(data, function(response) {
            // Success
            // Hide the loading screen
            $ionicLoading.hide();
            // Redirect
            $scope.userConnected();
            //PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
          }, function(response) {
            // Fail
            // Hide the loading screen
            $ionicLoading.hide();
            PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
          });


         // PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant(result.access_token));

				// $http.get('https://www.strava.com/oauth/authorize' + result.access_token).then(
				// 	function(response) {
				// 		// Success
				// 		if (response && response.data && response.data.email && response.data.id) {
				// 			// We have everything we need to connect / create the user
				// 			UserService.connectSocialMedia({ email: response.data.email, name: response.data.name, id: response.data.id, socialMedia: 'strava' }, function(response2) {
				// 				// Success
				// 				$scope.userConnected();
				// 			}, function(response2) {
				// 				// Fail
				// 				$scope.userNotConnected(response2);
				// 			});
				// 		}
				// 		else {
				// 			// Hide the loading screen
				// 			$ionicLoading.hide();
				// 			PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('no response from strava'));
				// 		}
				// 	}, function(response) {
				// 		// Fail
				// 					// Hide the loading screen
				// 		$ionicLoading.hide();
				// 		PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('$http.get fail'));
				// 	}
				// );
					}, function(error) {
							// Fail
							// Hide the loading screen
          UtilitiesService.log("DEBUG", "$cordovaOauth.strava fail");
				$ionicLoading.hide();
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant("$cordovaOauth.strava fail"));
					});
		});
	};

	// If the user wants to use the application whitout internet connection
	$scope.loginOffline = function() {
		UserService.setOfflineMode(true);
		$scope.userConnected();
	};

});


}) ();
