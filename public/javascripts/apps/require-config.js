/*  This is the configuration for the require.js loading.  See requirejs.org for more info. 

  It should be loaded directly before the require.js is loaded in a page.  */

var require = {
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "jquery-truncate":      "../vendor/jquery.truncate.min",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
        "jquery-ui-effect":     "../vendor/jquery-ui/ui/jquery.ui.effect",
        "jquery-ui-blind":      "../vendor/jquery-ui/ui/jquery.ui.effect-blind",
        "stickit":              "../vendor/backbone-stickit/backbone.stickit"

    },
   // urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'jquery-ui-effect': ['jquery'],
        'jquery-ui-blind': ['jquery-ui-effect'],
        'jquery-truncate': ['jquery'],
        'XDate':{ exports: 'XDate'},
        'stickit': ['Backbone','jquery']
    }
};
