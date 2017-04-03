
(function(){
angular.module('controllers').controller('OnBoardingCtrl', function($scope, $ionicHistory, $state, $ionicSlideBoxDelegate, UserService, ActivityService, UtilitiesService) {
  UtilitiesService.log("*ENTERPAGE", "OnBoarding");
  UtilitiesService.checkVersion();

    //Creates a new and empty Activity Object while destroying the current global one
    var myActivity = ActivityService.newActivity();
    myActivity.activityName = "Hello From OnBoarding";



	// Used to remove the slide bounce when on the first and last slide
	$scope.myActiveSlide = 0;

	// Swipe to the next page
	$scope.nextSlide = function() {
	  UtilitiesService.log("*ENTERPAGE", "OnBoarding page: "+ $scope.myActiveSlide);
	$ionicSlideBoxDelegate.next();
	};

	// Redirect to the login page
	$scope.goToLoginPage = function() {
		// Make the next page the root history, so we can't use the back button to come back to the previous page
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("login");
	};


	// Used to remove the slide bounce when on the first and last slide
	$scope.enableSlide = function() {
		$ionicSlideBoxDelegate.enableSlide(true);
	};
	// Used to remove the slide bounce when on the first and last slide
	$scope.$watch(function(scope) { return scope.myActiveSlide },
		function(newValue, oldValue) {
			// Disable slide on the first and last slide
			if (newValue == 0 || newValue == 2)
				$ionicSlideBoxDelegate.enableSlide(false);
		}
	);
});

})();
