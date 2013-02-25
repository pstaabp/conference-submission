//require config
require.config({
    paths: {
        "Backbone":             "../vendor/backbone-0.9.9",
        "backbone-validation":  "../vendor/backbone-validation",
        "underscore":           "../vendor/underscore",
        "jquery":               "../vendor/jquery",
        "bootstrap":            "../vendor/bootstrap/js/bootstrap",
        "XDate":                "../vendor/xdate",
        "config":               "./config"
    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'backbone-validation': ['Backbone'],
        'XDate':{ exports: 'XDate'}
    }
});

require(['Backbone', 'underscore',
    '../models/UserList','../models/User','../models/ProposalList',"../views/WebPage","../views/PersonalInfoView","../views/ProposalView","./common",
    'bootstrap'],
function(Backbone, _, UserList, User, ProposalList,WebPage,PersonalInfoView,ProposalView,common){
    var FacultyView = WebPage.extend({
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render','userFetched','proposalsFetched');  // include all functions that need the this object
            var self = this;

            this.proposals = new ProposalList();
            this.render();

            $('#submit-main-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            }); 

            this.user = new User({_id: $("#user-id").val()});

            this.user.fetch({success: this.userFetched});


            $("#logout").on("click",common.logout); 


        },
        render: function () {
            this.$el.html("");
            this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
            var self = this;
            this.$el.append(_.template($("#faculty-tabs-template").html()));

            
            if (this.user) {
                new PersonalInfoView({el: $("#personal"), user: this.user, editMode: false, parent: self});
            }

            this.proposalViews = [];
            this.proposals.each(function(prop,i){
                $("#submit-main-tabs").append("<li><a href='#prop" + (i+1) +"'>Proposal #" + (i+1) + "</a></li>");
                if (prop.get("sponsor_statement")===""){
                    $("a[href='#prop"+ (i+1) + "']").addClass("review-needed");
                }
                $(".tab-content").append("<div class='tab-pane' id='prop"+ (i+1)+ "'></div>")

                //$(".tab-content").append(_.template($("#new-proposal-template").html()));
                self.proposalViews.push(new ProposalView({model: prop, el: $("#prop"+(i+1)), parent: self, facultyView: true}));
            });
            this.activateTabs();


        },
        activateTabs: function(){
            $('#submit-main-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });   
        },
        userFetched: function(model, response, options) {
            this.render();
            this.proposals.fetch({data: $.param({ sponsor_email: this.user.get("email")}),success: this.proposalsFetched});
        },
        proposalsFetched: function(collection, response, options) {          
            var self = this;
            console.log("proposalsFetched");
            console.log(this.proposals);
            this.render();
        }
    });

    new FacultyView({el: $("#container")});
});