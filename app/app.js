"use strict";

angular.module("myGardenApp", ['ui.router'])
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
      // HOME STATES AND NESTED VIEWS ========================================
      .state('home', {
          url: '/home',
          views: {
            '': { templateUrl: 'home.html' },
            'active-plants@home': { 
              templateUrl: 'active-garden.html',
              controller: 'ActiveCtrl'
            },
            'to-plant@home': { 
              templateUrl: 'to-plant.html',
              controller: 'ToPlantCtrl'
            },
            'search-plants@home': { 
              templateUrl: 'search-plants.html',
              controller: 'PlantSearchCtrl'
            },
            'plant-alerts@home': { 
              templateUrl: 'plant-alerts.html',
              controller: 'PlantAlertCtrl'
            }

          }
      });
  
  });

  