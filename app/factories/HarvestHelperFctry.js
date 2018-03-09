"use strict";

angular.module("myGardenApp").factory("HarvestHelperFctry", function($http, $q, API_Key) {

  const searchByID = (plantID) => {
    return $q((resolve, reject) => {
      $http
      .get(`https://harvesthelper.herokuapp.com/api/v1/plants/${plantID}?api_key=${API_Key.harvestHelper}`)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("api error", err);
      });
    });
  };

  return { searchByID };

});