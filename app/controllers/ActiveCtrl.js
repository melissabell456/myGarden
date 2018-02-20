"use strict";

angular.module("myGardenApp").controller("ActiveCtrl", function($scope, HarvestHelperFctry, UserPlantFctry, PlantStatsFctry, $state, $q) {

  let currentUser = firebase.auth().currentUser.uid;
  // let status = "active-plant";
  $scope.plantArr = [];
  // scoping today's date for use as max-date in date selector
  $scope.todayDate = moment().format('MM/DD/YYYY');
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);

  
// BUILDING USER PLANT OBJECTS FOR USE IN PARTIAL

  // gets current user's plants
  UserPlantFctry.getAllUserPlants(currentUser)
  .then( (userPlants) => {
    for (let plant in userPlants) {
      // build plantStats object with user specific properties recieved from firebase
      let plantStats = {};
      plantStats.status = userPlants[plant].status_id;
      plantStats.fbID = plant;
      plantStats.notes = userPlants[plant].notes;
      plantStats.userPlant_date = userPlants[plant].planted_date;
      if (plantStats.status === "active-plant") {
        plantStats.water_date = userPlants[plant].lastWaterDate;
        // sending active plant to determine whether the plant has surpassed recommended watering parameters 
        needsWater(userPlants[plant])
        .then( (bool) => {
          // after water recommendations are determined, adding needsWatering boolean as property on plantStats obj 
          plantStats.needsWatering = bool;
          return HarvestHelperFctry.searchByID(userPlants[plant].id);
        })
        .then ( (apiData) => {
          // adding properties on plantStats obj from API data
          plantStats.name = apiData.name;
          plantStats.water_req = apiData.watering;
          plantStats.img = apiData.image;
          plantStats.pests = apiData.pests;
          plantStats.diseases = apiData.diseases;
          plantStats.harvesting = apiData.harvesting;
          // pushes final object to array for use in partial
          $scope.plantArr.push(plantStats);
        });
      }
      else {
        // if plant is not active status, the plant is checked to see if it has surpassed recommended planting date
        needsPlanting(userPlants[plant].id)
        .then( (bool) => {
          // after planting recommendation is determined, adds property to plantStats obj
          plantStats.sowSeason = bool;
          return HarvestHelperFctry.searchByID(userPlants[plant].id);
        })
        .then ( (apiData) => {
          // continues to build up object with APIdata
          plantStats.name = apiData.name;
          plantStats.sun_req = apiData.optimal_sun;
          plantStats.plant_date = apiData.when_to_plant;
          plantStats.growing_from_seed = apiData.growing_from_seed;
          plantStats.img = apiData.image;
          // pushes final object to array for use in partial
          $scope.plantArr.push(plantStats);
        });
      }
    }
  });

// DETERMINE PLANT NEEDS

  const needsWater = (plant) => {
    let waterMonth = +((plant.lastWaterDate).slice(0,2));
    let waterDay = +((plant.lastWaterDate).slice(3,5));
    let waterMoment = moment([+year, +waterMonth, +waterDay]);
    let daysSinceWatered = today.diff(waterMoment, 'days');
    // each plant is sent to firebase dataset which includes watering requirements for plants.
    return $q( (resolve, reject) => {
      PlantStatsFctry.searchByID(plant.id)
      .then ( (plantStats) => {
          let reqWater = plantStats[Object.keys(plantStats)[0]].water_interval;
          // if the user has not watered their plant for longer than the suggested frequency, this is resolved as true, else false
          if (daysSinceWatered > reqWater) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
    });
  };

  const needsPlanting = (plantID) => {
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


// REACTIONS TO USER INTERACTION

  // when user "plants" an unplanted plant or archives an existing plant, the status gets updated in firebase and additional properties are added to plant objects

  $scope.changePlantStatus = (firebaseID, status) => {
    let statusUpdate={};
    if (status === "active-plant") {
      statusUpdate = {
        planted_date: $scope.todayDate,
        status_id: "active-plant",
        status: `${currentUser}_${status}`,
        lastWaterDate: moment().format('MM/DD/YYYY')
      };
    }
    else {
      statusUpdate = {
        archive_date: $scope.todayDate,
        status_id: status,
        status: `${currentUser}_${status}`
      };
    }
    UserPlantFctry.editUserPlant(firebaseID, statusUpdate)
    .then( () => {
      $state.reload();
      $scope.status = status;
      console.log("should reload and filter for active or for archived only");
    });
  };

  // when user selects new water date, this patches user's last logged water date with update
  $scope.updateUserPlant = (prop, newData, firebaseID) => {
    let patch = {[prop]: newData};
    UserPlantFctry.editUserPlant(firebaseID, patch)
    .then( () => {
      console.log("should reload and filter for active only");
      $scope.status = "active-plant";
      // $state.reload();
    });
  };

    // when user selects to remove a plant, this permanently removes user plant
  $scope.removePlant = (plant) => {
    UserPlantFctry.removeUserPlant(plant)
    .then( () => {
      $state.reload();
      console.log("should reload and filter for active only");
      $scope.status = "active-plant";
    });
  };

  // when user clicks to view more information on a certain plant, these show/hide pop-ups 
  $scope.showPopover = (plant) => {
    $scope.popoverIsVisible = true;
    $scope.popoverPlant = plant;
  };
  
  $scope.hidePopover = () => {
    $scope.popoverIsVisible = false;
    $scope.notePopoverIsVisible = false;
  };

  $scope.showNotePopUp = (plant) => {
    $scope.notePopoverIsVisible = true;
    $scope.popoverPlant = plant;
  };



});