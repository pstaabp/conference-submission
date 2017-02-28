define(['backbone','models/User','apps/settings'], function(Backbone,User,settings){
  /**
  *
  * This defines an Author
  *
  * @type {*}
  */

  var Student = User.extend({
    defaults: function(){
        var _user_defaults = User.prototype.defaults;
        _(_user_defaults).extend({
          major: "",
          grad_year: 2000,
          presented_before: false
        });
        return _user_defaults;
    },
    url : function() {
      console.log(settings.top_dir + '/students/' + this.get("_id"));
      return settings.top_dir + '/students/' + this.get("_id");
    },
  });


  return Student;
});
