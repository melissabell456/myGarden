"use strict";

let isAuth = (AuthFctry, $window) =>
new Promise((resolve, reject) => {
  AuthFctry.isAuthenticated().then(userBool => {
    if (userBool) {
        resolve();
    } else {
        $window.location.href = "#!/home";
        reject();
    }
  });
});

angular.module("myGardenApp", ['ui.router', 'moment-picker'])
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('auth', {
      url: '/',
      templateUrl: '/partials/user-auth.html',
      controller: 'AuthCtrl'
    })
    .state('home', {
      url: '/myGarden',
      resolve: { isAuth },
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
  })
  .run(fbCreds => {
    let creds = fbCreds;
    let authConfig = {
      apiKey: creds.apiKey,
      authDomain: creds.authDomain
    };
    firebase.initializeApp(authConfig);
  });
  