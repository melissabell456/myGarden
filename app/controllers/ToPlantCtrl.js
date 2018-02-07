"use strict";

angular.module("myGardenApp").controller("ToPlantCtrl", function($scope, UserPlantFctry) {

  $scope.header = "To Plant Partial Linked";
  let currentUser = firebase.auth().currentUser.uid;
  let status = "to-plant";

  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (usersPlants) => {
    console.log(usersPlants, "shuold scope this");
  });

});