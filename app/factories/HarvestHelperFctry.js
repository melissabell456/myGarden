"use strict";

angular.module("myGardenApp").factory("HarvestHelperFctry", function($http, $q, API_Key) {

  const searchByID = (plantID) => {
    console.log(plantID);
    return $q((resolve, reject) => {
      $http
      .get(`http://harvesthelper.herokuapp.com/api/v1/plants/${plantID}?api_key=${API_Key.harvestHelper}`)
      .then(({ data }) => {
        // console.log(data);
        resolve(data);
      })
      .catch((err) => {
        console.log("api error", err);
      });
    });
  };

  return { searchByID };

});