"use strict";

angular.module("myGardenApp").controller("ActiveCtrl", function($scope, HarvestHelperFctry, UserPlantFctry, $state) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "active-plant";
  $scope.plantArr = [];
  // scoping today's date for use as max-date in date selector
  $scope.maxSelectDate = moment().format('MM/DD/YYYY');

// call to firebase to get the currently authenticated users active plants
  UserPlantFctry.getUserPlants(currentUser, status)
  // building objects with access to user's plant properties AND API properties for partial use
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

// called in response to calendar update, this patches user's last logged water date with selected date
  $scope.updateWaterDate = (time, id) => {
    let waterPatch = {lastWaterDate: time};
    UserPlantFctry.editUserPlant(id, waterPatch);
  };

});