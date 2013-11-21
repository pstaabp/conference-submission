/*  This is the configuration for the require.js loading.  See requirejs.org for more info. 

  It should be loaded directly before the require.js is loaded in a page.  */

var require = {
    baseUrl: "/conference-submission/javascripts",
    paths: {
        "Backbone":             "bower_components/backbone/backbone",
        "backbone-validation":  "bower_components/backbone-validation/dist/backbone-validation",
        "underscore":           "bower_components/underscore/underscore",
        "jquery":               "bower_components/jquery/jquery",
        "jquery-truncate":      "bower_components/jquery-truncate/jquery.truncate",
        "bootstrap":            "bower_components/bootstrap/docs/assets/js/bootstrap",
        "moment":               "bower_components/moment/moment",
        "jquery-ui":            "bower_components/jquery-ui/ui/jquery-ui",
        "stickit":              "bower_components/backbone.stickit/backbone.stickit"
    },
   // urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'jquery-ui': ['jquery'],
        'jquery-truncate': ['jquery'],
        'moment': {exports: "moment"},
        'stickit': ['Backbone','jquery']
    }
};
