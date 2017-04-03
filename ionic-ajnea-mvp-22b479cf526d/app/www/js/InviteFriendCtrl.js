(function() {

	angular
		.module('controllers')
		.controller('InviteFriendCtrl', InviteFriendCtrl)

	function InviteFriendCtrl ($scope, $state, $translate,  UserService, PopupService, ActivityService, SettingService, UtilitiesService, $ionicSideMenuDelegate, BLE) {

	UtilitiesService.log("*ENTERPAGE", "Invite Friend");

		$scope.invite = {};

				$scope.inviteFriendEmail = function() {
					 UtilitiesService.log("EMAIL", "sendEmail function: " + $scope.invite.email);


					UtilitiesService.sendInvite($scope.invite.email, UserService.getUsername(), UserService.getEmail(),
						function (response) {
							UtilitiesService.log("TOBEDEBUG", "sendEmail succes");
							PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
						},
						function (response) {
							UtilitiesService.log("TOBEDEBUG", "sendEmail fail ");
							PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
						}
					);
				};

			}

InviteFriendCtrl.$inject = ['$scope', '$state', '$translate',  'UserService', 'PopupService', 'ActivityService', 'SettingService', 'UtilitiesService', '$ionicSideMenuDelegate', 'BLE']
}());
