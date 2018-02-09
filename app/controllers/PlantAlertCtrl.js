"use strict";

angular.module("myGardenApp").controller("PlantAlertCtrl", function($scope, UserPlantFctry, PlantStatsFctry) {

  $scope.plantAlerts = [];
  let currentUser = firebase.auth().currentUser.uid;
  let today = moment().format('MM/DD/YYYY');

  // sends request to firebase for the current user's active plants
  UserPlantFctry.getUserPlants(currentUser, "active-plant")
  .then( (activePlants) => {
    // filters through active plants to determine which plants have not been watered today to send to database with additional data needed
    for (let plant in activePlants) {
      let lastWatering = activePlants[plant].lastWaterDate;
      if (lastWatering !== today) {
        activePlants[plant].fbID = plant;
        let lastWateringMoment = moment(activePlants[plant].lastWaterDate);
        activePlants[plant].userWaterInt = convertDate(lastWateringMoment.from(today));
        getPlantStats(activePlants[plant]);
      }
    }
  });

  const convertDate = (momentStringDate) => {
    let integerDateRange = momentStringDate.slice('')[0] === "a"? 1: +momentStringDate.slice(0,2); 
    return integerDateRange;
  };
  
  // takes object of plant which has not been watered today
  const getPlantStats = (userPlant) => {
    // console.log("should have string on it", userPlant);
    // sends request to retrieve plant stats
    PlantStatsFctry.searchByID(userPlant.id)
    .then ( (plantStats) => {
      $scope.waterAlerts = [];
      for (let stats in plantStats) {
        let reqWater = plantStats[stats].water_interval;
        if (userPlant.userWaterInt > reqWater) {
          console.log(plantStats[stats]);
          $scope.waterAlerts.push(plantStats[stats]);
        }
      console.log($scope.waterAlerts);
      }
    });
  };

  // PLANTING TIME ALERTS
  // get user's to-plant plants
  // send ID's to firebase for plant dates
  // compare today's date to plant date. if todays date > plant date, print alert

});