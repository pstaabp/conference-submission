require([
  // Load our app module and pass it to our definition function
  'apps/AdminPage',
], function(App){
  // The "app" dependency is passed in as "App"
  App.initialize();
});