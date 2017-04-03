(function() {

	angular
		.module('controllers')
		.controller('ReportBugCtrl', ReportBugCtrl)

	function ReportBugCtrl ($window, $scope, $state, $translate,  UserService, PopupService, ActivityService, SettingService, UtilitiesService, $ionicSideMenuDelegate, $ionicLoading, $ionicPlatform , BLE) {
		var window = $window;
		console.log("window is here!!!!!!!!!!!!!!!", $window);
		console.log(ionic.Platform.device());
		console.log(ionic.Platform.version());
		console.log(ionic.Platform.platform());


	UtilitiesService.log("*ENTERPAGE", "Report Bug");

		$scope.report = {};

				$scope.reportBug = function() {
					 UtilitiesService.log("Bug", "sendBug function: " + $scope.report.bug);
					 $ionicLoading.show();
					 UtilitiesService.log("username", UserService.getUsername());
					 var filename = "user_log.txt";
					 var ionicDevice = ionic.Platform.device();

					 UtilitiesService.log("userEmail", UserService.getEmail());

					UtilitiesService.sendBug(cordova.file.dataDirectory, filename, $scope.report.bug, ionicDevice, UserService.getEmail(), UserService.getUsername(),
						function (response) {
							console.log("window variable is here!!!!!", window);
							window.location.hash = "#/menu/CreateActivity";
							UtilitiesService.log("TOBEDEBUG", "sendEmail succes");
							$ionicLoading.hide();
							PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
						},
						function (response) {
							UtilitiesService.log("TOBEDEBUG", "sendEmail fail ");
							$ionicLoading.hide();
							PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
						}
					);
				};

			}


ReportBugCtrl.$inject = ['$window', '$scope', '$state', '$translate',  'UserService', 'PopupService', 'ActivityService', 'SettingService', 'UtilitiesService', '$ionicSideMenuDelegate', '$ionicLoading','$ionicPlatform', 'BLE']
}());

$("button").on("click", function(){
  console.log(UserService.GetUserName());
});
