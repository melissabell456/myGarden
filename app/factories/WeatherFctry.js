"use strict";

angular.module("myGardenApp").factory("WeatherFctry", function($http, $q, API_Key) {

  const getHistoricalRain = (YYYYMMDD) => {
    return $q( (resolve, reject) => {
      $http
      .get(`https://api.wunderground.com/api/${API_Key.weather}/history_${YYYYMMDD}/q/TN/Nashville.json`)
      .then( ({ data: {history: {dailysummary}} }) => {
        let rainInches = dailysummary[0].rain;
        if (rainInches > 0) {
          resolve(YYYYMMDD);
        }
        else {
          resolve("noRain");
        }
      })
      .catch( (err) => {
        console.log(YYYYMMDD, "fail", err);
      });
    });
  };

  return { getHistoricalRain};

});