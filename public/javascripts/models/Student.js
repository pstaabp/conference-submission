define(['backbone','models/User','apps/settings'], function(Backbone,User,settings){
  /**
  *
  * This defines an Author
  *
  * @type {*}
  */

  var Student = User.extend({
    defaults: {
      major: "",
      grad_year: "",
      presented_before: false,
    },
    url : function() {
      console.log(settings.top_dir + '/students/' + this.get("_id"));
      return settings.top_dir + '/students/' + this.get("_id");
    },
  });


  return Student;
});
