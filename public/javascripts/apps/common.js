define(['backbone','moment','stickit','backbone-validation'], function(Backbone,moment){

    var common = {
        getParameterByName: function(name)
        {
          name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          var regexS = "[\\?&]" + name + "=([^&#]*)";
          var regex = new RegExp(regexS);
          var results = regex.exec(window.location.search);
          if(results == null)
            return "";
          else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        presentation_types: [
          "Poster Presentation",
          "Oral Presentation",
          "Music",
          "Art (2D)",
          "Art (3D)",
          "Theatre",
          "Video",
          "Creative Writing"
        ],
        proposalParams : [{class: ".session", field: "session"},{class:".title",field: "title"},
          {class: ".sponsor-name", field: "sponsor_name"}, {class: ".sponsor-email", field: "sponsor_email"},
          {class: ".sponsor-dept", field: "sponsor_dept"}, {class: ".type", field: "type"}],
        majors: [
         {label: "Biology", value: "Biology"},
         {label: "Business Administration", value: "Business Administration"},
         {label: "Chemistry", value: "Chemistry"},
         {label: "Communications Media", value: "Communications Media"},
         {label: "Computer Information Systems", value: "Computer Information Systems"},
         {label: "Computer Science", value: "Computer Science"},
         {label: "Criminal Justice", value: "Criminal Justice"},
         {label: "Early Childhood Education", value: "Early Childhood Education"},
         {label: "Earth Systems Science", value: "Earth Systems Science"},
         {label: "Economics", value: "Economics"},
         {label: "Elementary Education", value: "Elementary Education"},
         {label: "English Studies", value: "English Studies"},
         {label: "Exercise and Sports Science", value: "Exercise and Sports Science"},
         {label: "Game Design", value: "Game Design"},
         {label: "Geography", value: "Geography"},
         {label: "History", value: "History"},
         {label: "Human Services", value: "Human Services"},
         {label: "Industrial Technology", value: "Industrial Technology"},
         {label: "Interdisciplinary Studies", value: "Interdisciplinary Studies"},
         {label: "Mathematics", value: "Mathematics"},
         {label: "Middle School Education", value: "Middle School Education"},
         {label: "Nursing", value: "Nursing"},
         {label: "Occupational/Vocational Education", value: "Occupational/Vocational Education"},
         {label: "Political Science", value: "Political Science"},
         {label: "Psychological Science", value: "Psychological Science"},
         {label: "Sociology", value: "Sociology"},
         {label: "Special Education", value: "Special Education"},
         {label: "Technology Education (Grades 5-12)", value: "Technology Education (Grades 5-12)"},
         ],
         departments: ["Behavioral Sciences", "Biology & Chemistry",
                                "Business Administration",
                                "Communications Media", "Computer Science", "Economics, History & Political Science",
                                "Education","English Studies","Exercise & Sports Science", "Geo/Physical Science",
                                "Humanities","Industrial Technology","Mathematics","Nursing","Other"],
         invertBindings: function(_bindings){
           var _bind = _(_bindings).mapObject(function(_val,_key){
             return _.isObject(_val)?_val.observe: _val;
           });
           return _.invert(_bind);
         }
    }

  Backbone.Stickit.addHandler([{selector: "td[contenteditable='true']",events: ['blur']}
    , {selector: ".show-date-time",onGet: function(val){
        return moment(val).format("MM/DD/YYYY [at] hh:mmA");
    }}]);

    // The following are Backbone Validation setup

    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    _.extend(Backbone.Validation.patterns, {
        gradyear: /^201\d$/,
    });

    _.extend(Backbone.Validation.messages, {
      gradyear: 'Please enter a valid graduation year'
    });

    return common;

});
