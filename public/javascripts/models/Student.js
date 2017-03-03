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
    validation: {
        grad_year: {
          required: true
        },
        // grad_year: function(value,attr,computedState){
        //     if(_(this.get("role")).contains("student")){
        //         if(! /^20[1-2][0-9]$/.test(value)){
        //              return "Please enter a valid graduation date.";
        //          }
        //      }
        // },
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
