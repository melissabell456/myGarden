"use strict";

angular.module("myGardenApp").controller("ToPlantCtrl", function($scope, UserPlantFctry, HarvestHelperFctry) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "to-plant";
  $scope.plantArr = [];


  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (usersPlants) => {
    // console.log(usersPlants, "shuold scope this");
    for (let plant in usersPlants) {
      let plantStats = {};
      plantStats.notes = usersPlants[plant].notes;
      HarvestHelperFctry.searchByID(usersPlants[plant].id)
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.sun_req = plantData.optimal_sun;
        plantStats.plant_date = plantData.when_to_plant;
        plantStats.img = plantData.image;
        // console.log("printer", plantStats);
        $scope.plantArr.push(plantStats);
      });
    }
  });

});