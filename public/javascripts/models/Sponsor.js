define(['backbone','models/User','apps/settings'], function(Backbone,User,settings){

  var Sponsor = User.extend({
    defaults: function(){
        var _user_defaults = User.prototype.defaults;
        _(_user_defaults).extend({
          department: "",
        });
        return _user_defaults;
    },
    url : function() {
      console.log(settings.top_dir + '/sponsors/' + this.get("_id"));
      return settings.top_dir + '/sponsors/' + this.get("_id");
    },
  });


  return Sponsor;
});
