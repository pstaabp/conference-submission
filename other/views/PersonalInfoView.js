define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var PersonalInfoView = Backbone.View.extend({
    	template: _.template($("#user-view").html()),
    	initialize: function () {
    		_.bindAll(this,"render");
    		this.render();
    	},
    	render: function (){
    		this.$el.html(this.template);
    	}


    });

    return PersonalInfoView;

});