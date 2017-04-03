  (function() {

    angular
    	.module('controllers')
      .controller('SettingCtrl', SettingCtrl)

    function SettingCtrl ($scope, $state, $translate,  UserService, PopupService, ActivityService, SettingService, UtilitiesService, $ionicSideMenuDelegate, BLE) {

  UtilitiesService.log("*ENTERPAGE", "Setting");
  $scope.mySettings = SettingService.getSettings();

	var storage = window.localStorage;
  var bledevice = window.localStorage.getItem("LatestBLEDevice")

	$scope.SaveSettings = function() {
    UtilitiesService.log("DEBUG", "$scope.mySettings.debugMode "+ $scope.mySettings.debugMode);
    SettingService.localsave($scope.mySettings);
    SettingService.saveSettings(UserService.getUserId(), $scope.mySettings);
    console.log("HERE IS ALL OF MYSETTING: ", SettingService.getSettings());
    // REMOVE ALERT SINCE WE NOW SAVE AUTOMATICALLY ONCHANGE
		// PopupService.showAlert("Settings", "Settings saved successfully!");
    UtilitiesService.log("Current units: " + $scope.mySettings.unit);
	};

    UtilitiesService.log("BLECONNECT", "getting bledevice");
    UtilitiesService.log(null,null);

    console.dir(bledevice);

  if(bledevice!=null){
    BLE.connect(bledevice.id).then(function(){
      UtilitiesService.log("BLECONNECT", "connected to BLE");
    });
  }else{
    UtilitiesService.log("BLECONNECT", "NOT connected to BLE");
  }

}

SettingCtrl.$inject = ['$scope', '$state', '$translate',  'UserService', 'PopupService', 'ActivityService', 'SettingService', 'UtilitiesService', '$ionicSideMenuDelegate', 'BLE']
}());
