(function () {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular
    .module('controllers')
    .controller('bleConnectCtrl', ['$scope', '$stateParams', '$state', '$translate', '$ionicLoading', 'ActivityService', 'PopupService', 'BLE', '$cordovaCapture', '$cordovaFile', 'AudioServices', 'UtilitiesService',
      function ($scope, $stateParams, $state, $translate, $ionicLoading, ActivityService, PopupService, BLE, $cordovaCapture, $cordovaFile, AudioServices, UtilitiesService) {
      UtilitiesService.log("*ENTERPAGE", "BleConnect");

    // keep a reference since devices will be added
    $scope.devices = BLE.devices;
    $scope.isdeviceconnected = false;

    $scope.myConnectedDevice = null;
    if (ble) {
      ble.enable(
        //success
        function (enablesuccess) {
          UtilitiesService.log("DEBUG", enablesuccess);
        },
        //fail
        function (enablefail) {
          console.dir(enablefail);
        });
    }
    console.dir($scope.myConnectedDevice);

    $scope.bytesToString = function (buffer) {
      console.log(buffer);
      //if (typeof buffer != 'undefined'){
      return String.fromCharCode.apply(null, new Uint16Array(buffer));
      // } else{
      //   return;
      // }
    };


    $scope.send = function () {
      BLE.sendData(myConnectedDevice.id, $scope.textOption);
      UtilitiesService.log("DEBUG", $scope.textOption)
    };

    $scope.disconnect = function () {
      BLE.disconnect(myConnectedDevice.id);
      $scope.myConnectedDevice = null;
      console.dir($scope.myConnectedDevice);
    };

    var success = function () {
      if ($scope.devices.length < 1) {
        // a better solution would be to update a status message rather than an alert
        alert("Didn't find any Bluetooth Low Energy devices.");
      }
    };

    var failure = function (error) {
      alert(error);
    };


    // pull to refresh
    $scope.onRefresh = function () {
      BLE.scan().then(
        success, failure
      ).finally(
        function () {
          $scope.$broadcast('scroll.refreshComplete');
        }
      )
    };

    $scope.goToHome = function () {
      $state.go("menu.CreateActivity");
      UtilitiesService.log("*ENTERPAGE", "go to CreateActivity page");
    };

    $scope.connecting = function (inputDevice) {
      myConnectedDevice = inputDevice;

      for (i = 0; i < $scope.devices.length; i++) {
        $scope.devices[i].isConnected = false;
      }//reset all devices.inputDevice.isConnected to false

      BLE.connect(myConnectedDevice.id).then(function () {
        UtilitiesService.log("DEBUG", "> $scope.BLE.connect()");
        console.dir(myConnectedDevice);
        window.localStorage.setItem("LatestBLEDevice", myConnectedDevice);
        window.localStorage.setItem("LatestBLEDeviceID", myConnectedDevice.id);
        UtilitiesService.log("DEBUG", "LatestBLEDevice: "+  myConnectedDevice.id);
        console.dir(myConnectedDevice);
        //add check mark to device ??
        var arrayBuffer = BLE.getNotificationBLE(myConnectedDevice.id);
        $scope.messageReceived = $scope.bytesToString(arrayBuffer);
        myConnectedDevice.isConnected = true;

      });
      // var arrayBuffer = BLE.getNotificationBLE(myConnectedDevice.id);
      // //console.log(arrayBuffer);
      // //$scope.messageReceived = $scope.bytesToString(arrayBuffer);
      // BLE.connect(myConnectedDevice.id);
    };

    $scope.scan = function () {
      BLE.scan().then(success, failure);
    };

    $scope.showMessageRecieved = function () {
      PopupService.showAlert('Received', $scope.messageReceived);
    };

    // initial scan
    BLE.scan().then(success, failure);

  }]);

})();
