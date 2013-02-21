//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'XDate':{ exports: 'XDate'},
    }
});

require(['Backbone', 'underscore','../views/WebPage','./common'],
function(Backbone, _,WebPage, common){

    var LoginPage = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this,"render");
            this.render();
            $("#logout").on("click",common.logout);
        },
        render: function () {
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
        }

    });

    new LoginPage({el: $("#container")});
});