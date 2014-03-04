/*  This is the configuration for the require.js loading.  See requirejs.org for more info. 

  It should be loaded directly before the require.js is loaded in a page.  */

var require = {
    baseUrl: "/conference-submission/javascripts",
    paths: {
        "backbone":               "bower_components/backbone/backbone",
        "backbone-validation":    "bower_components/backbone-validation/dist/backbone-validation",
        "underscore":             "bower_components/underscore/underscore",
        "jquery":                 "bower_components/jquery/jquery",
        "jquery-truncate":        "bower_components/jquery-truncate/jquery.truncate",
        "bootstrap":              "bower_components/bootstrap/dist/js/bootstrap",
        "moment":                 "bower_components/moment/moment",
        "jquery-ui":              "bower_components/jquery-ui/ui/jquery-ui",
        "stickit":                "bower_components/backbone.stickit/backbone.stickit"
    },
    waitSeconds: 15,
    shim: {
        "stickit": ['backbone'],
        "jquery": {exports: "$"},
        "underscore": { exports: '_' },
        "backbone": { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        "bootstrap":['jquery','jquery-ui'],
        "backbone-validation": ['backbone'],
        "jquery-ui": ['jquery'],
        "jquery-truncate": ['jquery'],
        "moment": {exports: "moment"}
        
    }
};
