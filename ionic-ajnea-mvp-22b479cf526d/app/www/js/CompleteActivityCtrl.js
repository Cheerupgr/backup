(function () {

  //controller code goes in here with syntax : "angular.module('controllers').controller........
  angular.module('controllers').controller('CompleteActivityCtrl', function ($scope, $stateParams, $state, $ionicLoading, $translate, $ionicPopover, $ionicHistory, $ionicSideMenuDelegate, $rootScope, PopupService, ActivityService, UserService, SettingService, UtilitiesService) {
    UtilitiesService.log("*ENTERPAGE", "CompleteActivity");
    $scope.myActivity = $stateParams.activity;
    $scope.currentActivity = $stateParams.currentActivity;
    $scope.time = $stateParams.time;


    $scope.notifrepeat = 5;
    UtilitiesService.log("FINISHACTIVITY", "-$scope.myActivity-");
    console.dir($scope.myActivity);
    UtilitiesService.log("FINISHACTIVITY", "-$scope.currentActivity-");
    console.dir($scope.currentActivity);

    var userScore = UserService.getUserScore(30, UserService.getGender(), UserService.getUserVO2($scope.myActivity.info.averageSpeed));

    addSeshSucess = function (response) {
      UtilitiesService.log("DEBUG", "The Sesh is  saved ");
    };

    addSeshFail = function (response) {
      UtilitiesService.log("DEBUG", "The Sesh is not saved ");
    };

    //Here I need to save the sesh contained in $scope.currentActivity
    $scope.SaveSession = function () {

      UtilitiesService.log("SaveSession", "SaveSession " + $scope.user);
      UserService.addSession($scope.currentActivity, $scope.currentActivity._id, addSeshSucess, addSeshFail);// add activity in the DB
      UserService.updateUserScore(UserService.getEmail(), userScore);
    };


    var mySettings = SettingService.getSettings();
    $scope.unit = mySettings.unit;
    $scope.displayUnit = SettingService.getDisplayUnit($scope.unit);
    UtilitiesService.log("DEBUG", "---------------------  " + $scope.unit);
    UtilitiesService.log("DEBUG", ">debugMode in localstorage is: " + mySettings.debugMode);

    $scope.currentActivity.info.averageSpeed = ActivityService.getAverageSpeed($scope.currentActivity);
    $scope.currentActivity.info.elevationGain = ActivityService.getElevationGain($scope.currentActivity);
    $scope.currentActivity.info.elevationLoss = ActivityService.getElevationLoss($scope.currentActivity);
    $scope.currentActivity.info.maxSpeed = ActivityService.getMaxSpeed($scope.currentActivity);
    $scope.currentActivity.info.calories = ActivityService.getCaloriesSpent($scope.currentActivity.info.completedTime);
    //TODO: need impementation in ActivityService
    $scope.currentActivity.info.score = ActivityService.getActivityScore($scope.currentActivity);
    $scope.currentActivity.info.power = ActivityService.getAverageEstimatedPowerOutput($scope.currentActivity);
    $scope.referenceTime = [];
    $scope.finalTime = [];

    $scope.findBestTime = function () {
      console.log("findBestTime ");
      for (var index = 0; index < $scope.currentActivity.notifications.length; index++) {
        var best = $scope.myActivity.notifications[index].metricObject[0].interval;
        var bestID = -1;

        for (var i = 0; i < $scope.currentActivity.notifications[index].metricObject.length; i++) {
          $scope.currentActivity.notifications[index].metricObject[i].bestTime = false;
          if ($scope.currentActivity.notifications[index].metricObject[i].interval < best) {

            best = $scope.currentActivity.notifications[index].metricObject[i].interval;
            bestID = i;
          }

        }
        if (bestID != -1) {
          $scope.currentActivity.notifications[index].metricObject[bestID].bestTime = true;
        }
      }

    };

    $scope.AllNotifications = Array.from($scope.myActivity.notifications);
    $scope.AllNotifications = ActivityService.getAllNotifications($scope.myActivity);
    $scope.findBestTime();

    for(i=0; i< $scope.myActivity.notifications.length;i++){
      $scope.referenceTime[i] = 0;
      $scope.finalTime[i] = 0;
    };



    $scope.setAsReference = function (parentNotif, metricId) {
      UtilitiesService.log("DEBUG", "set new reference time for notification:" + parentNotif + " = " + metricId);
      $scope.referenceTime[parentNotif] = metricId;
      $scope.myActivity.notifications[parentNotif].metricObject[0] = $scope.currentActivity.notifications[parentNotif].metricObject[metricId];
      // then save
    };

    $scope.setAsFinalLap = function (notif){
      $scope.finalTime[notif] = notif;
      $scope.myActivity.info.completedTime = $scope.currentActivity.notifications[$scope.currentActivity.notifications.length-1].metricObject[notif].lapTime;
    };

    $scope.AllNotifications = Array.from($scope.myActivity.notifications);
    $scope.currentNotifications = Array.from($scope.currentActivity.notifications);

    $scope.getCurrentMetricObjectFrom = function (index) {
      //console.log("getCurrentMetricObjectFrom"+index+""+$scope.currentActivity.notifications[index].metricObject.length);
      return $scope.currentActivity.notifications[index].metricObject;
    };

    $scope.getFinishNotification = function () {
      return $scope.currentActivity.notifications[$scope.currentActivity.notifications.length-1].metricObject;
    }

    $scope.SaveSession();

    gotoActivityList = function () {
      $ionicSideMenuDelegate.canDragContent(true);
      $rootScope.hideTabs = false;
      $ionicHistory.goBack();
      $ionicHistory.removeBackView();
      $state.go("menu.myActivitiesList");

    };
    $scope.finish = function () {

      // update activity
      ActivityService.updateActivity($scope.myActivity, function (success) {
        UtilitiesService.log("DEBUG", "updateActivity from controller:" + success);
        gotoActivityList();
      }, function (error) {
        UtilitiesService.log("DEBUG", "updateActivity from controller:" + error);
        //TODO: well we should do something better here, like adding this task to a queue
        gotoActivityList();
      });


    }

  });
})();
