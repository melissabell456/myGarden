"use strict";

angular.module("myGardenApp").factory("PlantStatsFctry", function($http, $q) {

  const searchByName = (searchTerm) => {
    return $q( ( resolve, reject ) => {
      $http
      .get('https://mygarden-f2283.firebaseio.com/plants.json')
      .then( ({ data }) => {
        // taking users search entry and changing to regex to broaden search params
        let rejexSearch = new RegExp(searchTerm, "i");
        // checking plants for matches by plant name
        let searchResults = data.filter(plant => rejexSearch.test(plant.name));
        // pulling out id of each match to prep for sending to API
        let matchedResults = searchResults.map( plant => plant.id);
        resolve(matchedResults);
      })
      .catch( (error) => {
        resolve(error);
      });
    });
  };

  // const searchByName = (searchTerm) => {
  //   console.log(searchTerm);
  //   return $q( (resolve, reject) => {
  //     $http
  //     .get(`https://mygarden-f2283.firebaseio.com/plants.json?orderBy="name"&equalTo="${searchTerm}"`)
  //     .then( ({ data }) => {
  //       let plant = Object.keys(data);
  //       let plantID = data[plant].id;
  //       resolve(plantID);
  //     })
  //     .catch( (err) => {
  //       console.log(err);
  //     });
  //   });
  // };

  const searchByID = (plantID) => {
    return $q( (resolve, reject) => {
      $http
      .get(`https://mygarden-f2283.firebaseio.com/plants.json?orderBy="id"&equalTo=${plantID}`)
      .then( ( { data } ) => {
        resolve(data);
      })
      .catch( (err) => {
        console.log(err);
      });
    });
  };

  return { searchByName, searchByID };

});