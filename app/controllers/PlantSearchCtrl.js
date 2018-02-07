"use strict";

angular.module("myGardenApp").controller("PlantSearchCtrl", function($state, $scope, PlantStatsFctry, HarvestHelperFctry, UserPlantFctry) {

  // let uid = firebase.auth().currentUser.uid;
  $scope.header = "Plant Search";
  $scope.searchTerm = "";

  // this function is triggered when user clicks Search btn
  $scope.searchDB = () => {
    // plant name is passed in to query firebase to gather plant id necessary to query API
    PlantStatsFctry.searchByName($scope.searchTerm)
    .then((plantSearchResult) => {
      // request is sent to API to get only that plant ID's result
      return HarvestHelperFctry.searchByID(plantSearchResult);
    })
    .then((dbResult) => {
      $scope.searchResult = dbResult;
    });
  };

  $scope.addPlant = (plant) => {
    let plantToAdd = {
      id: plant,
      uid: firebase.auth().currentUser.uid,
      status: `${firebase.auth().currentUser.uid}_to-plant`,
      notes: "",
    };
    UserPlantFctry.addToPlantList(plantToAdd)
    .then( () => {
      $state.reload('home');
    });
  };
  
});