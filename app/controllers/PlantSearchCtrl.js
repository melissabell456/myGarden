"use strict";

angular.module("myGardenApp").controller("PlantSearchCtrl", function($scope, PlantStatsFctry) {

  $scope.header = "Plant Search";
  $scope.searchTerm = "";

  $scope.searchDB = () => {
    PlantStatsFctry.searchByName($scope.searchTerm)
    .then((plantSearchResult) => {
      console.log(plantSearchResult);
    });
  };
  
});