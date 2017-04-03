(function() {

  angular
  	.module('controllers')
    .controller('AboutCtrl', AboutCtrl)

  function AboutCtrl ($scope, $state, $translate, UserService, PopupService, ActivityService, $ionicSideMenuDelegate, BLE,UtilitiesService) {

    $scope.devices = BLE.devices;
    $scope.myConnectedDevice = null;

    $scope.connecting = function (device) {
      $scope.bluetoothDevice = device;
      BLE.connect(device.id);
    };

$scope.openInAppBrowser = function opensite(site)
{
 // Open in app browser

 window.open(site,'_blank');


};
    $scope.playBLE = function playBLE(val)
    {
      UtilitiesService.log("BLECONNECT", 'triggerBLE ' + val);
      if (typeof myConnectedDevice != 'undefined') {
        UtilitiesService.log("BLECONNECT", 'triggerBLE BLE' + val);
        BLE.sendData(myConnectedDevice.id, val);
      }


    };




  }

  AboutCtrl.$inject = ['$scope', '$state', '$translate', 'UserService', 'PopupService', 'ActivityService','$ionicSideMenuDelegate', 'BLE','UtilitiesService']

}());
