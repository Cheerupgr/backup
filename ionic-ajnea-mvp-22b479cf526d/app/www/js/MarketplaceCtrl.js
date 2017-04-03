( function() {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('marketplaceCtrl', function($scope, $ionicPopover, $state, $ionicHistory, $translate, $ionicLoading, UserService, ActivityService, PopupService,UtilitiesService, SettingService, UtilitiesService) {
    UtilitiesService.log("*ENTERPAGE", "Marketplace");
    $scope.convertSec=UtilitiesService.convertTime;

    $scope.$on('$ionicView.enter', function () {
      UtilitiesService.log("DEBUG", '>>$ionicView.enter');
      var mySettings = SettingService.getSettings();
      $scope.unit = mySettings.unit;
      $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
      UtilitiesService.log("DEBUG", '>>$ionicView.enter');
      $scope.debugMode = mySettings.debugMode;
      $scope.bluetoothMode = mySettings.bluetoothMode;
      $scope.marketActivities = UserService.getMarketActivities();
    });

    String.prototype.toInitial= function () {
      var output = this.substr(0,1);
      return output;
    };

    //Array of cards of marketList
    UtilitiesService.log("DEBUG", 'activities inside markeplaceCtrl.');
    $scope.marketActivities = [];



    $ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
    UserService.connectToMarket(function(response) {
      // Success
      UtilitiesService.log("DEBUG", "Success getting Marketplace data");
      $scope.marketActivities = response;
      console.log ("================================================");
      console.dir($scope.marketActivities);
      $ionicLoading.hide();
    }, function(response) {
      // Fail
      UtilitiesService.log("MARKET", "Fail getting Marketplace data");
      $ionicLoading.hide();
    });


    //SearchBar model
    $scope.searchOption = '';

    //searchBar ng-change function
    $scope.changeSearch = function (searchInput){
      UtilitiesService.log("MARKET", 'searchInput is: ' + searchInput);
    };

    //ionic-ratings
    $scope.ratingsObject = {
      iconOn : 'ion-ios-star',
      iconOff : 'ion-ios-star-outline',
      iconOnColor: 'rgb(255, 105, 0)',
      iconOffColor:  'rgb(255, 105, 0)',
      rating:  3,
      minRating:0,
      index:0,
      readOnly: false,
      callback: function(id, index) {    //Mandatory
        $scope.ratingsCallback(id, index);
      }
    };

    $scope.getRatingsObject = function(defaultRating, marketItemId) {
      //console.log("///////////////////marketItemId :"+ marketItemId);
      if (defaultRating == null) defaultRating = 0;
      // console.log("getRatingsObject "+ defaultRating);
      $scope.ratingsObject.rating = Math.round(defaultRating);
      var ratedMarket = UserService.getUser().marketItemIdRated;
      if (ratedMarket != undefined) {
        //console.dir(ratedMarket);

        if (ratedMarket.indexOf(marketItemId) != -1) {
          $scope.ratingsObject.iconOnColor = "rgb(200, 200, 200)";
          $scope.ratingsObject.iconOffColor = "rgb(200, 200, 200)";
          $scope.ratingsObject.readOnly = true;
        }else{
          $scope.ratingsObject.iconOnColor = "rgb(255, 105, 0)";
          $scope.ratingsObject.iconOffColor = "rgb(255, 105, 0)";
          $scope.ratingsObject.readOnly = false;
        }

      }

      return $scope.ratingsObject;
    };

    $scope.ratingsCallback = function(rating, marketplaceItemID) {
      UtilitiesService.log("MARKET", 'Selected rating is : ', rating + ", index "+ marketplaceItemID);
      UserService.updateMarketItemRating(rating, marketplaceItemID, UserService.getUserId() , function (response) {

        // Success
        UtilitiesService.log("MARKET", 'Succces');
        var a=1;
        //userConnected();
      }, function (response) {
        // Fail
        UtilitiesService.log("MARKET", 'Fail');
        // userNotConnected(response);
      });
      event.stopPropagation();
    };

    // Spinner when getting decks
    $scope.gettingDecks = true;
    // User's decks
    $scope.myDecks = [];
    // Variable to know which tab we are
    $scope.myDecksTabsActivated = true;



    // Refresh after one seconde if we are in offline mode
    if (UserService.getOfflineMode() == true) {
      window.alert('You are in offline mode and cannot access the marketplace');
    }


    $scope.previewMarketItem = function(marketItem){
      UtilitiesService.log("MARKET", 'previewMarketItem this activity');
      $state.go("menu.markertplaceItem", {marketItem: marketItem});
    }

    $scope.getInitials = function(name){
      // Done
      return name.substring(0,1);

    };



    $scope.refresh = function(){
      UtilitiesService.log("MARKET", 'pressed refresh');
      $scope.marketActivities = [];
      $scope.marketActivities = UserService.getMarketActivities();
      $scope.$broadcast('scroll.refreshComplete');
      // UserService.getMarketActivities().then(
      //   //success2
      //   function(success){
      //     success.forEach(function(marketItem, index, array){
      //       $scope.marketActivities.push(success.activity);
      //     });
      //     //$scope.$apply();
      //     $scope.$broadcast('scroll.refreshComplete')
      //   },
      //   //fail2
      //   function(fail2){
      //     UtilitiesService.log("MARKET", 'failed to refresh marketList');
      //     $scope.$broadcast('scroll.refreshComplete')
      //   });
    }

  });

}) ();
