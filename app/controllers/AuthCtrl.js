"use strict"; 

angular.module("myGardenApp").controller("AuthCtrl", function( $scope, AuthFctry ) {

  $scope.userSignIn = () => {
    AuthFctry.loginUser();
  };

});