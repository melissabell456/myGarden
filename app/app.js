"use strict";

angular.module("myGardenApp", ['ui.router'])
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
      // HOME STATES AND NESTED VIEWS ========================================
      .state('home', {
          url: '/',
          views: {
            '': { templateUrl: '/partials/home.html' },
            'active-plants@home': { 
              templateUrl: '/partials/active-garden.html',
              controller: 'ActiveCtrl'
            },
            'to-plant@home': { 
              templateUrl: '/partials/to-plant.html',
              controller: 'ToPlantCtrl'
            },
            'search-plants@home': { 
              templateUrl: '/partials/search-plants.html',
              controller: 'PlantSearchCtrl'
            },
            'plant-alerts@home': { 
              templateUrl: '/partials/plant-alerts.html',
              controller: 'PlantAlertCtrl'
            }

          }
      });
  
  });

  