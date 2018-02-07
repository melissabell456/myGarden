"use strict";

angular.module("myGardenApp").factory("UserPlantFctry", function($http, $q) {

  const FBUrl = "https://mygarden-f2283.firebaseio.com";

  const addToPlantList = (plantObj) => {
    console.log(plantObj);
    return $q( (resolve, reject) => {
      $http
      .post(`${FBUrl}/user-plants.json`,
      JSON.stringify(plantObj))
      .then( ({ data: {name} }) => {
        console.log(name, "plant was added");
        resolve(name);
      })
      .catch( (err) => {
        console.log("error", err);
      });
    });
  };

  const getUserPlants = (uid, status) => {
    let fbQuery = `${uid}_${status}`;
    return $q( (resolve, reject) => {
      $http
      .get(`${FBUrl}/user-plants.json?orderBy="status"&equalTo="${fbQuery}"`)
      .then( ({ data }) => {
        resolve(data);
      })
      .catch( (err) => {
        console.log("could not retrieve user plants", err);
      });
    });
  };

  const editUserPlant = (fbID, dataPatch) => {
    console.log(fbID, dataPatch);
    return $q( (resolve, reject) => {
      $http
      .patch(`${FBUrl}/user-plants/${fbID}.json`, 
      JSON.stringify(dataPatch))
      .then( (data) => {
        console.log(data, "success?");
        resolve(data);
      })
      .catch( (err) => {
        console.log("no luck", err);
      });
    });
  };

  return { addToPlantList, getUserPlants, editUserPlant };

});