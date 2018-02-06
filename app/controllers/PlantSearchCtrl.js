"use strict";

angular.module("myGardenApp").controller("PlantSearchCtrl", function($scope, PlantStatsFctry, HarvestHelperFctry) {

  $scope.header = "Plant Search";
  $scope.searchTerm = "";

  $scope.searchDB = () => {
    return PlantStatsFctry.searchByName($scope.searchTerm)
    .then((plantSearchResult) => {
      // console.log(plantSearchResult);
      $scope.searchResult = HarvestHelperFctry.searchByID(plantSearchResult);
    });
  };
  
});