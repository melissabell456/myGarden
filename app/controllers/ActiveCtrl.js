"use strict";

angular.module("myGardenApp").controller("ActiveCtrl", function($scope, HarvestHelperFctry, UserPlantFctry) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "active-plant";
  $scope.plantArr = [];


  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (usersPlants) => {
    for (let plant in usersPlants) {
      let plantStats = {};
      plantStats.fbID = plant;
      plantStats.water_date = usersPlants[plant].lastWaterDate;
      plantStats.notes = usersPlants[plant].notes;
      HarvestHelperFctry.searchByID(usersPlants[plant].id)
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.water_req = plantData.watering;
        plantStats.img = plantData.image;
        $scope.plantArr.push(plantStats);
      });
    }
  });

});