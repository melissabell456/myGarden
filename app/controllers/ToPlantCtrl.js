"use strict";

angular.module("myGardenApp").controller("ToPlantCtrl", function($state, $scope, UserPlantFctry, HarvestHelperFctry) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "to-plant";
  $scope.plantArr = [];


  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (usersPlants) => {
    for (let plant in usersPlants) {
      let plantStats = {};
      plantStats.fbID = plant;
      plantStats.notes = usersPlants[plant].notes;
      HarvestHelperFctry.searchByID(usersPlants[plant].id)
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.sun_req = plantData.optimal_sun;
        plantStats.plant_date = plantData.when_to_plant;
        plantStats.img = plantData.image;
        $scope.plantArr.push(plantStats);
      });
    }
  });

  $scope.addAsActive = (plantFBID) => {
    let statusUpdate = {
      status: `${currentUser}_active-plant`,
      lastWaterDate: moment().format('MM/DD/YYYY')
    };
    UserPlantFctry.editUserPlant(plantFBID, statusUpdate)
    .then( () => {
      $state.reload('home');      
    });
  };

  $scope.removePlant = (plant) => {
    console.log(plant);
    UserPlantFctry.removeUserPlant(plant)
    .then( () => {
      $state.reload();
    });
  };

});