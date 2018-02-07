# myGarden

myGarden is a webApp that allows an authenticated user to create a virtual representation of their physical garden. myGarden is targeted towards newer (or forgetful) gardeners who will find relief in relying on an app to manage reminders re: watering frequency and planting season on a plant by plant basis (selected by users). 

myGarden uses the harvest_helper API (https://github.com/damwhit/harvest_helper) to provide specific planting requirements per each plant. I utilized harvest_helper data as well as a planting calendar on almanac.com (https://www.almanac.com/gardening/planting-dates/TN) to put together an additional data set to quantify watering frequencies and planting dates for user alert purposes. 

## Requirements to run this app on your machine:

1. Fork and clone the repo onto your machine
2. `cd` into the `/lib` folder and run `npm install` to download all the required dependencies.
3. API Keys - these will be added in app/config/api_keys.js as an object (format below) 
 + You will need to get an API key from harvest_helper to use any plant search/add functionality. Documentation for requesting an API key can be found at http://harvesthelper.herokuapp.com/


to be continued