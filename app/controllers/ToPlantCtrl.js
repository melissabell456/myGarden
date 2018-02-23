"use strict";

angular.module("myGardenApp").controller("ToPlantCtrl", function($state, $scope, UserPlantFctry, HarvestHelperFctry, PlantStatsFctry, $q) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "to-plant";
  $scope.plantArr = [];
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);

  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (userPlants) => {
    console.log("to-grow", userPlants);
    for (let plant in userPlants) {
      // build plantStats object with user specific properties recieved from firebase
      let plantStats = {};
      plantStats.status = userPlants[plant].status_id;
      plantStats.fbID = plant;
      plantStats.notes = userPlants[plant].notes;
      plantStats.userPlant_date = userPlants[plant].planted_date;
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
  });

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

  // USER INTERACTIONS
  
  $scope.changePlantStatus = (firebaseID, status) => {
    let statusUpdate = {
        wat: 'toplantctrl',
        planted_date: moment().format('MM/DD/YYYY'),
        status_id: "active-plant",
        status: `${currentUser}_${status}`,
        lastWaterDate: moment().format('MM/DD/YYYY')
      };
    UserPlantFctry.editUserPlant(firebaseID, statusUpdate)
    .then( () => {
      $state.go('home');
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