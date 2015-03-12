// make sure that require-config.js is loaded before this file. 
define(['module','jquery','backbone', 'underscore','views/WebPage','bootstrap'],
function(module,$, Backbone, _,WebPage){

// define(['module','jquery','backbone','views/WebPage','models/ProposalList','models/UserList','models/JudgeList','apps/UsersView'],
// function(module,$,Backbone,WebPage,ProposalList,UserList,JudgeList,UsersView){
    var BasicPage = WebPage.extend({
        initialize: function () {
            WebPage.prototype.initialize.apply(this, {el: this.el});
            this.render();
        },
        render: function () {
            WebPage.prototype.render.apply(this);  // Call  WebPage.render(); 
        },
    });


    new BasicPage({el: $("#container")});
});