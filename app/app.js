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
        'search-plants@home': { 
          templateUrl: '/partials/search-plants.html',
          controller: 'PlantSearchCtrl'
        }
      }
    })
    .state('to-plant', {
      url: '/to-plant',
      resolve: { isAuth },
      views: {
        '': { templateUrl: '/partials/to-plantNav.html' },
        'search-plants@to-plant': { 
          templateUrl: '/partials/search-plants.html',
          controller: 'PlantSearchCtrl'
        },
        'to-plantView@to-plant': { 
          templateUrl: '/partials/to-plant.html',
          controller: 'ToPlantCtrl'
        }
      }
    })
    .state('archived-plants', {
      url: '/archivedGarden',
      resolve: { isAuth },
      views: {
        '': { templateUrl: '/partials/archivedNav.html' },
        'search-plants@archived-plants': { 
          templateUrl: '/partials/search-plants.html',
          controller: 'PlantSearchCtrl'
        },
        'archived-plantView@archived-plants': { 
          templateUrl: '/partials/archived-garden.html',
          controller: 'ArchivedCtrl'
        }
      }
    });
// closing main config
  })
  .run(fbCreds => {
    let creds = fbCreds;
    let authConfig = {
      apiKey: creds.apiKey,
      authDomain: creds.authDomain
    };
    firebase.initializeApp(authConfig);
  });