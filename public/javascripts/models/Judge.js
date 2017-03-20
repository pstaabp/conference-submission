define(['backbone', 'underscore','models/User','apps/settings'], function(Backbone, _,User,settings){
    /**
     *
     * This defines a Judge which is a subclass of a User
     *
     * @type {*}
     */
    var Judge = User.extend({
        defaults: function(){
            var _user_defaults = User.prototype.defaults;
            _(_user_defaults).extend({
              judge_type: "",
              judge_topics: [],
              judge_sessions: []
            });
            return _user_defaults;
        },
        url : function() {
          //console.log(settings.top_dir + '/judges/' + this.get("_id"));
          return settings.top_dir + '/judges/' + this.get("_id");
        },

    });

    return Judge;
});
