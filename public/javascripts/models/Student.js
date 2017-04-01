define(['backbone','models/User','apps/settings'], function(Backbone,User,settings){
  /**
  *
  * This defines a Student
  *
  * @type {*}
  */

  var Student = User.extend({
    defaults: function(){
        var _user_defaults = User.prototype.defaults;
        _(_user_defaults).extend({
          major: "",
          grad_year: 2020,
          presented_before: false
        });
        return _user_defaults;
    },
    validation: {
        grad_year: {
          required: true
        },
        major: function(value, attr, computedState) {
            if(_(this.get("role")).contains("student")){
                if(value==="" || value == null){
                     return "You must select a major.";
                 }
            }
        }
    },
    url : function() {
      return settings.top_dir + '/students/' + this.get("_id");
    },
  });


  return Student;
});
