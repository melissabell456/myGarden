"use strict";

angular.module("myGardenApp").controller("PlantSearchCtrl", function($state, $scope, PlantStatsFctry, HarvestHelperFctry, UserPlantFctry) {

  // let uid = firebase.auth().currentUser.uid;
  $scope.header = "Plant Search";
  $scope.searchTerm = "";


  // this function is triggered when user clicks Search btn
  $scope.searchDB = () => {
    $scope.searchResult= [];
    // plant name is passed in to query firebase to gather plant id necessary to query API
    PlantStatsFctry.searchByName($scope.searchTerm)
    .then((plantSearchResults) => {
      // request is sent to API to get only that plant ID's result
      plantSearchResults.forEach( plant => {
        return HarvestHelperFctry.searchByID(plant)
        .then((dbResult) => {
          $scope.searchResult.push(dbResult);
        });
      });
    });
  };

  // receives plant.ID of plant selected and adds user plant properties, then sends to patch to firebase user collection
  $scope.addPlant = (plant) => {
    let plantToAdd = {
      id: plant,
      uid: firebase.auth().currentUser.uid,
      status: `${firebase.auth().currentUser.uid}_to-plant`,
      status_id: "to-plant",
      notes: ""
    };
    UserPlantFctry.addToPlantList(plantToAdd)
    .then( () => {
      $state.reload('home');
    });
  };

  $scope.showPopover = (plant) => {
    $scope.popoverIsVisible = true;
    $scope.popoverPlant = plant;
  };
  
  $scope.hidePopover = () => {
    $scope.popoverIsVisible = false;
  };
  
});