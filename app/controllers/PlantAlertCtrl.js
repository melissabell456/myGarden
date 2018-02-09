"use strict";

angular.module("myGardenApp").controller("PlantAlertCtrl", function($scope, UserPlantFctry, PlantStatsFctry) {


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

  // gets today's stats formatted for use with moment methods 
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today2 = moment([+year, +month, +day]);
  console.log(today2);

  // PLANTING TIME ALERTS
  // get user's to-plant plants
  UserPlantFctry.getUserPlants(currentUser, "to-plant")
  .then( (to_Plant) => {
    // console.log(to_Plant, "plant these");
    $scope.plantAlerts = [];
    for (let plant in to_Plant) {
      return PlantStatsFctry.searchByID(to_Plant[plant].id)
      .then( (plantData) => {
        for (let plant in plantData) {
          let plantMonth = +((plantData[plant].plant_date).slice(0,2));
          let plantDay = +((plantData[plant].plant_date).slice(3,5));
          let plantDate = moment([+year, +plantMonth, +plantDay]);
          let daysUntilPlant = plantDate.diff(today2, 'days');
          console.log(daysUntilPlant);
          // the plant date is head of today 
          if (daysUntilPlant <= 0) {
            console.log(plantData[plant].name, "has passed the suggested planting date");
            $scope.plantAlerts.push(plantData[plant]);
          }
        }
      });
    }
  });

  // send ID's to firebase for plant dates
  // compare today's date to plant date. if todays date > plant date, print alert

});