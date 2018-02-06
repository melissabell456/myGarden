"use strict";

angular.module("myGardenApp").factory("PlantStatsFctry", function($http, $q) {

  const searchByName = (searchTerm) => {
    console.log(searchTerm);
    return $q( (resolve, reject) => {
      $http
      .get(`https://mygarden-f2283.firebaseio.com/plants.json?orderBy="name"&equalTo="${searchTerm}"`)
      .then( (plantResult) => {
        resolve(plantResult);
      })
      .catch( (err) => {
        console.log(err);
      });
    });
  };

  return { searchByName };

});