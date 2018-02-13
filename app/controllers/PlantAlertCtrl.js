"use strict";

angular.module("myGardenApp").controller("PlantAlertCtrl", function($scope, UserPlantFctry, PlantStatsFctry) {


  let currentUser = firebase.auth().currentUser.uid;
  // today's stats formatted for use with moment method .diff
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);
  
  // let today = moment().format('MM/DD/YYYY');

  // sends request to firebase for the current user's active plants
  UserPlantFctry.getUserPlants(currentUser, "active-plant")
  .then( (activePlants) => {
    // filters through active plants to determine which plants have not been watered today to send to database with additional data needed
    for (let plant in activePlants) {
      let waterMonth = +((activePlants[plant].lastWaterDate).slice(0,2));
      let waterDay = +((activePlants[plant].lastWaterDate).slice(3,5));
      let waterDate = moment([+year, +waterMonth, +waterDay]);
      let daysSinceWatered = today.diff(waterDate, 'days');
      if (daysSinceWatered > 0) {
        activePlants[plant].fbID = plant;
        activePlants[plant].userWaterInt = daysSinceWatered;
        getPlantStats(activePlants[plant]);
      }
    }
  });
  
  // takes object of plant which has not been watered today
  const getPlantStats = (userPlant) => {
    // sends request to retrieve plant stats
    $scope.waterAlerts = [];
    PlantStatsFctry.searchByID(userPlant.id)
    .then ( (plantStats) => {
      for (let stats in plantStats) {
        let reqWater = plantStats[stats].water_interval;
        if (userPlant.userWaterInt > reqWater) {
          $scope.waterAlerts.push(plantStats[stats]);
        }
      }
    });
  };

  // PLANTING TIME ALERTS
  // get user's to-plant plants
  UserPlantFctry.getUserPlants(currentUser, "to-plant")
  .then( (to_Plant) => {
    $scope.plantAlerts = [];
    for (let plant in to_Plant) {
      PlantStatsFctry.searchByID(to_Plant[plant].id)
      .then( (plantData) => {
        for (let plant in plantData) {
          // formatting last entered water date for use with moment method .diff which returns number of days between two dates
          let plantMonth = +((plantData[plant].plant_date).slice(0,2));
          let plantDay = +((plantData[plant].plant_date).slice(3,5));
          let plantDate = moment([+year, +plantMonth, +plantDay]);
          let daysUntilPlant = plantDate.diff(today, 'days');
          if (daysUntilPlant <= 0) {
            console.log(plantData[plant].name, "has passed the suggested planting date");
            $scope.plantAlerts.push(plantData[plant]);
          }
        }
      });
    }
  });


});