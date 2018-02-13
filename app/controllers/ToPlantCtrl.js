"use strict";

angular.module("myGardenApp").controller("ToPlantCtrl", function($state, $scope, UserPlantFctry, HarvestHelperFctry, PlantStatsFctry, $q) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "to-plant";
  $scope.plantArr = [];
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);

// sends request for all user's plants with the status of to-plant
  UserPlantFctry.getUserPlants(currentUser, "to-plant")
  .then( (usersPlants) => {
    // loops through all plants to begin building a plantStats object including necessary properties needed from user and from Harvest Helper API for this category of plant
    for (let plant in usersPlants) {
      let plantStats = {};
      plantSeason(usersPlants[plant].id)
      .then( (bool) => {
        plantStats.sowSeason = bool;
        plantStats.fbID = plant;
        plantStats.notes = usersPlants[plant].notes;
        return HarvestHelperFctry.searchByID(usersPlants[plant].id);  
      })
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.sun_req = plantData.optimal_sun;
        plantStats.plant_date = plantData.when_to_plant;
        plantStats.img = plantData.image;
        $scope.plantArr.push(plantStats);
      });
    }
  });

  const plantSeason = (plantID) => {
    return $q( (resolve, reject) => {
      PlantStatsFctry.searchByID(plantID)
      .then ( (plantStats) => {
        let plantDate = plantStats[Object.keys(plantStats)[0]].plant_date;
        let plantMonth = +((plantDate).slice(0,2));
        let plantDay = +((plantDate).slice(3,5));
        let plantMoment = moment([+year, +plantMonth, +plantDay]);
        let daysUntilPlant = plantMoment.diff(today, 'days');
          if (daysUntilPlant <= 0) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
    });
  };

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