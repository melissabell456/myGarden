"use strict";

angular.module("myGardenApp").controller("ActiveCtrl", function($scope, HarvestHelperFctry, UserPlantFctry, PlantStatsFctry, $state, $q) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "active-plant";
  $scope.plantArr = [];
  // scoping today's date for use as max-date in date selector
  $scope.maxSelectDate = moment().format('MM/DD/YYYY');
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);

// call to firebase to get the currently authenticated users active plants
  UserPlantFctry.getUserPlants(currentUser, status)
  // building objects with access to user's plant properties AND API properties for partial use
  .then( (usersPlants) => {
    for (let plant in usersPlants) {
      let plantStats = {};
      needsWater(usersPlants[plant])
      .then( (bool) => {
        plantStats.needsWatering = bool;
        plantStats.fbID = plant;
        plantStats.water_date = usersPlants[plant].lastWaterDate;
        plantStats.notes = usersPlants[plant].notes;
        return HarvestHelperFctry.searchByID(usersPlants[plant].id);
      })
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.water_req = plantData.watering;
        plantStats.img = plantData.image;
        $scope.plantArr.push(plantStats);
        console.log("boolean?", $scope.plantArr);
      });
    }
  });

  const needsWater = (plant) => {
    console.log("ready to calculate water need", plant);
    let waterMonth = +((plant.lastWaterDate).slice(0,2));
    let waterDay = +((plant.lastWaterDate).slice(3,5));
    let waterMoment = moment([+year, +waterMonth, +waterDay]);
    let daysSinceWatered = today.diff(waterMoment, 'days');
    return $q( (resolve, reject) => {
      PlantStatsFctry.searchByID(plant.id)
      .then ( (plantStats) => {
        console.log("wut are stats", plantStats);
          let reqWater = plantStats[Object.keys(plantStats)[0]].water_interval;
          console.log("requirerment", reqWater, "VERSUS", "user water", daysSinceWatered );
          if (daysSinceWatered > reqWater) {
            console.log("true");
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
    });
};

// takes object of plant which has not been watered today
// const getPlantStats = (userPlant) => {
//   // sends request to retrieve plant stats
//   PlantStatsFctry.searchByID(userPlant.id)
//   .then ( (plantStats) => {
//     // console.log("wtf", plantStats);
//     for (let stats in plantStats) {
//       let reqWater = plantStats[stats].water_interval;
//       // console.log("requrment", reqWater, "user water", userPlant.userWaterInt );
//       if (userPlant.userWaterInt > reqWater) {
//         // userPlant.needsWatering = true;
//         return true;
//       }
//       else {
//         // userPlant.needsWatering = false;
//         return false;
//       }
      
//     }
//   });
// };



// called in response to calendar update, this patches user's last logged water date with selected date
  $scope.updateWaterDate = (time, id) => {
    let waterPatch = {lastWaterDate: time};
    UserPlantFctry.editUserPlant(id, waterPatch);
  };

  $scope.removePlant = (plant) => {
    console.log(plant);
    UserPlantFctry.removeUserPlant(plant)
    .then( () => {
      $state.reload();
    });
  };


});