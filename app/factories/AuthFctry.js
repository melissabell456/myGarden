"use strict"; 

angular.module("myGardenApp").factory("AuthFctry", function (fbCreds, $q, $window, $http){

  let provider = new firebase.auth.GoogleAuthProvider();

  const loginUser = () => {
      firebase.auth().signInWithPopup(provider)
          .then( (user) => { 
              $window.location.href = "#!/myGarden";
          })
          .catch(error => console.log('error', error));
  };

  const isAuthenticated = () => {
    console.log("Authentication: Called");
    return $q((resolve, reject) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

  return { loginUser, isAuthenticated };

});