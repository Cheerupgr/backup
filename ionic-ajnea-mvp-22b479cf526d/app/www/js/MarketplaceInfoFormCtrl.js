( function() {

	//controller code goes in here with syntax : "angular.module('controllers').controller........

angular.module('controllers').controller('MarketplaceInfoFormCtrl', function($scope, $ionicHistory, $state, $ionicSlideBoxDelegate, UserService, $translate, $stateParams, PopupService, ActivityService, $ionicSideMenuDelegate, AudioServices, UtilitiesService, SettingService, $ionicLoading, $ionicPopup) {
  UtilitiesService.log("*ENTERPAGE", "MarketplaceInfo");
    console.dir($stateParams);
    $scope.myActivity = $stateParams.activity;
    $scope.info = $scope.myActivity.info; //$scope.info object is an aggregation of the activities info object and is where the new data is stored
    $scope.authorName = $scope.myActivity.authorName; //For now we are using the user's email as the author

    var marketplaceItem = {};
    UtilitiesService.log("PUBLISH", 'User');
    console.dir(UserService.getUser());
    UtilitiesService.log("PUBLISH", 'UserID : ' + UserService.getUser()._id);
    UtilitiesService.log("PUBLISH", 'UserID type: ' + typeof UserService.getUser()._id);

  //Hide price list selction so that Marketplace items default to "free"
  var mySettings = SettingService.getServiceSettings();
  $scope.hidePriceList = mySettings.hidePriceList;

  $scope.price = 0;
  $scope.priceList = [
    { text: "Free", value: "0" , checked: true},
    { text: "$3.99", value: "3.99", checked: false  },
    { text: "$9.99", value: "9.99" , checked: false }
  ];

//Nothing happens, User is only sent back to correct preview of Activity
    $scope.back_button = function(){
        UtilitiesService.log("ACTION", 'Inside back_button');
        $state.go("menu.previewActivity", { activity: $stateParams.activity });

    }

//
    $scope.publishToMarketplace = function(){
        if($scope.info.description != null && $scope.info.description !='undefined' && $scope.info.description != ''){

                //new variable needed in activities
                $scope.myActivity.isInMarketplace = true;

                //new object needed in marketplace
                $scope.info.author = UserService.getUser()._id;
                $scope.info.price = $scope.price;
                $scope.info.rating = 0;
                $scope.info.isOnline = true;
                $scope.info.nbDownloads = 0;
                $scope.info.datePublished = Date.now();
                $scope.info.parentId = $scope.myActivity._id;
                UtilitiesService.log("PUBLISH",'inside publishToMarketplace');

                //console.dir($scope.myActivity);
                console.dir($scope.info);
                $ionicLoading.show();
                //Using service to interact with server
                UserService.publishToMarketplace($scope.myActivity, $scope.info,
                    function (response) {
                        // Success
                        $ionicLoading.hide();
                        UtilitiesService.log("PUBLISH", ' publishToMarketplace Succces');

                        //here we need to reconnect to the market (update the marketplaceitem)
                        UserService.connectToMarket(
                            function(){
                                UtilitiesService.log("PUBLISH", "update data from market :success");
                                $state.go("menu.marketplace");
                                $ionicHistory.removeBackView();
                                $ionicHistory.clearCache();
                                //Todo: we need to do something to reset navigation in this tab
                        },
                            function(){
                                UtilitiesService.log("PUBLISH", "update data from market :fail");
                            }
                        );

                    }, function (err) {
                        console.log("Unable to publish to Marketplace: ", err);
                        UtilitiesService.log("PUBLISH", 'publishToMarketplace Fail');
                        if (err.status === 409) {
                          PopupService.showAlert('Unable to Publish Activity','This activity already exists in the Marketplace');
                          $state.go("menu.previewActivity", { activity: $stateParams.activity });
                        }
                    });
        } else {
            PopupService.showAlert('Error Required Fields not completed','Make sure to set a price and write a  description first');
        }//else
    }//publishToMarketplace

    $scope.newActivityName = function(inputActivityName){
        $scope.name = inputActivityName;
    }

    $scope.newDescription = function(inputDescription){
        $scope.info.description = inputDescription;
    }

    // $scope.newPrice = function(inputNewPrice){
    //     $scope.info.price = inputNewPrice;
    // }
    $scope.updatePrice = function(item) {
          $scope.price=item.value;
    };

}); //End of angular.module

}) (); //end of function definition
