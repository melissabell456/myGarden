"use strict";

angular.module("myGardenApp").controller("ActiveCtrl", function($scope, HarvestHelperFctry, UserPlantFctry, PlantStatsFctry, WeatherFctry, $state, $q) {

  let currentUser = firebase.auth().currentUser.uid;
  let status = "active-plant";
  $scope.plantArr = [];
  // scoping today's date for use as max-date in date selector
  $scope.todayDate = moment().format('MM/DD/YYYY');
  let day = moment().format('DD');
  let month = moment().format('MM');
  let year = moment().format('YYYY');
  let today = moment([+year, +month, +day]);


// DETERMINE AMOUNT OF DAYS SINCE RAIN

  const getDaysSinceRained = () => {
    return $q( (resolve, reject) => {
      let weeklyWeatherPromises =[];
      let todayMoment = moment();
      // this will loop through the last 7 days to send request to weather API for rain for each day
        for (let i = 0; i < 7; i++) {
          let observeDate = moment(todayMoment).subtract(i, 'day').format('YYYYMMDD'); 
          weeklyWeatherPromises.push(WeatherFctry.getHistoricalRain(observeDate));
        }
        Promise.all(weeklyWeatherPromises)
        .then((weeklyRain) => {
          // console.log(weeklyRain);
          let daysWithRain = weeklyRain.filter( day => day !== "noRain" );
          let incrementalDays = daysWithRain.map( (day) => {
            let rainMonth = +(day.slice(4,6));
            let rainDay = +(day.slice(6,8));
            let rainMoment = moment([+year, +rainMonth, +rainDay]);
            let daysSinceDay = today.diff(rainMoment, 'days');
            // console.log(daysSinceRained, "how many days");
            return daysSinceDay;
          });
          console.log(incrementalDays);
          let daysSinceRained = incrementalDays.sort()[0];
          resolve(daysSinceRained);
        });
    });
  };



// BUILDING USER PLANT OBJECTS FOR USE IN PARTIAL

  // gets current user's plants
  UserPlantFctry.getUserPlants(currentUser, status)
  .then( (userPlants) => {
    getDaysSinceRained()
    .then( (int) => {
      let daysSinceRained = int;
      console.log("how many days since it has rained", daysSinceRained);
      for (let plant in userPlants) {
        // build plantStats object with user specific properties recieved from firebase
        let plantStats = {};
        plantStats.status = userPlants[plant].status_id;
        plantStats.fbID = plant;
        plantStats.notes = userPlants[plant].notes;
        plantStats.userPlant_date = userPlants[plant].planted_date;
        plantStats.water_date = userPlants[plant].lastWaterDate;
        // sending active plant to determine whether the plant has surpassed recommended watering parameters 
        needsWater(userPlants[plant], daysSinceRained)
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
    });
  });


// DETERMINE PLANT NEEDS

  const needsWater = (plant, daysSinceRained) => {
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
          if (daysSinceWatered > reqWater && daysSinceRained > reqWater) {
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