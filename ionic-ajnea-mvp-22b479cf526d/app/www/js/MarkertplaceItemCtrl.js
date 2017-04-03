( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........
angular.module('controllers').controller('MarkertplaceItemCtrl', function($scope, $ionicHistory, $state, $ionicSlideBoxDelegate, UserService, $translate, $stateParams, SettingService, PopupService, ActivityService, UtilitiesService) {
  UtilitiesService.log("*ENTERPAGE", "MarketplaceItem");

  //This is your activity variable whose properties you can manipulate
  var marketItem;
  var mySettings;

  $scope.$on('$ionicView.enter', function () {
    UtilitiesService.log("DEBUG", '>>$ionicView.enter');
    mySettings = SettingService.getSettings();
    $scope.unit = mySettings.unit;
    $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
    UtilitiesService.log("DEBUG", '>>$ionicView.enter');
    $scope.debugMode = mySettings.debugMode;
    $scope.bluetoothMode = mySettings.bluetoothMode;
  });
//
   marketItem = $stateParams.marketItem;
  UtilitiesService.log("MARKET", "marketItem:");
  console.dir(marketItem);
  $scope.marketItem = marketItem;
  $scope.myActivity = marketItem.activity;
  $scope.AllNotifications=Array.from($scope.myActivity.notifications);

  //ionic-ratings
  $scope.ratingsObject = {
    iconOn : 'ion-ios-star',
    iconOff : 'ion-ios-star-outline',
    iconOnColor: 'rgb(255, 105, 0)',
    iconOffColor:  'rgb(255, 105, 0)',
    rating:  3,
    minRating: 1,
    callback: function(rating) {
      $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    UtilitiesService.log("MARKET", 'Selected rating is : ', rating);
  };

  var userdata = localStorage.getItem('userdata');
  functionreturn  = function() {
    UserService.connect(JSON.parse(userdata), function (response) {
      // Success
      //userConnected();
    }, function (response) {
      // Fail
     // userNotConnected(response);
    });
  };

  $scope.buyMarketItem= function(marketItem) {
    UtilitiesService.log("BUY", "$scope.buyActivities");


    UserService.buyMarketItem(UserService.getEmail(),marketItem, $state, $scope.myActivity,functionreturn);
    //   .then(
    //   function(a){
    //     console.log("success");
    //     $state.go("menu.myActivitiesList", { activity: $scope.myActivity });
    //   },
    //   function(){
    //   console.log("error");
    //   // exceptions in transformData, or saveToIndexDB
    //   // will result in this error callback being called.
    // }
    // );



    //$state.go("menu.myActivitiesList", { activity: $scope.myActivity });
  };


});

}) ();
