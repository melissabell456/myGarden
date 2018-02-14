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

  // GETTING APPROPRIATE DATA

// call to firebase to get the currently authenticated users active plants
  UserPlantFctry.getUserPlants(currentUser, "active-plant")
  // building objects with necessary user plant properties AND API properties for partial use
  .then( (usersPlants) => {
    // first getting users plants
    for (let plant in usersPlants) {
      let plantStats = {};
      // each plant is resolved true or false after comparing # days since last water and water frequency requirement from firebase data set
      needsWater(usersPlants[plant])
      .then( (bool) => {
        plantStats.needsWatering = bool;
        plantStats.fbID = plant;
        plantStats.water_date = usersPlants[plant].lastWaterDate;
        plantStats.notes = usersPlants[plant].notes;
        plantStats.status = usersPlants[plant].status_id;
        // each plant is then queried to receive additional plant properties
        return HarvestHelperFctry.searchByID(usersPlants[plant].id);
      })
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.water_req = plantData.watering;
        plantStats.img = plantData.image;
        plantStats.pests = plantData.pests;
        plantStats.diseases = plantData.diseases;
        plantStats.harvesting = plantData.harvesting;
        // plantStats is fully built including user's data, water requirement bool, and API information which is then pushed to array for use in partial
        $scope.plantArr.push(plantStats);
      });
    }
  });

// call to firebase to get the currently authenticated users unplanted plants
  UserPlantFctry.getUserPlants(currentUser, "to-plant")
  .then( (usersPlants) => {
    // loops through all plants to begin building a plantStats object including necessary properties needed from user and from Harvest Helper API for this category of plant
    for (let plant in usersPlants) {
      let plantStats = {};
      plantSeason(usersPlants[plant].id)
      .then( (bool) => {
        plantStats.sowSeason = bool;
        plantStats.fbID = plant;
        plantStats.status = usersPlants[plant].status_id;
        plantStats.notes = usersPlants[plant].notes;
        return HarvestHelperFctry.searchByID(usersPlants[plant].id);  
      })
      .then( (plantData) => {
        plantStats.name = plantData.name;
        plantStats.sun_req = plantData.optimal_sun;
        plantStats.plant_date = plantData.when_to_plant;
        plantStats.growing_from_seed = plantData.growing_from_seed;
        plantStats.img = plantData.image;
        $scope.plantArr.push(plantStats);
      });
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
      $state.reload('home');      
    });
  };

  // when user selects new water date, this patches user's last logged water date with update
  $scope.updateUserPlant = (prop, newData, firebaseID) => {
    console.log("key", prop, "patch", newData, "fbID", firebaseID);
    let patch = {[prop]: newData};
    console.log("patch", patch);
    UserPlantFctry.editUserPlant(firebaseID, patch)
    .then( () => {
      $state.reload();
    });
  };

    // when user selects to remove a plant, this permanently removes user plant
  $scope.removePlant = (plant) => {
    console.log(plant);
    UserPlantFctry.removeUserPlant(plant)
    .then( () => {
      $state.reload();
    });
  };

  // when user clicks to view more information on a certain plant, these show/hide pop-ups 
  $scope.showPopover = (plant) => {
    console.log(plant);
    $scope.popoverIsVisible = true;
    $scope.popoverPlant = plant;
  };
  
  $scope.hidePopover = () => {
    $scope.popoverIsVisible = false;
    $scope.notePopoverIsVisible = false;
  };

  $scope.showNotePopUp = (plant) => {
    console.log(plant);
    $scope.notePopoverIsVisible = true;
    $scope.popoverPlant = plant;
  };



});