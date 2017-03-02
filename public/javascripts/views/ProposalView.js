define(['backbone', 'underscore','apps/settings','views/FeedbackView','apps/common','models/Student',
  'models/UserList','models/Sponsor', 'stickit','bootstrap','backbone-validation'],
function(Backbone, _,settings,FeedbackView,common,Student,UserList,Sponsor){
  /**
  *
  * This defines a ProposalView, which shows a single proposal
  */

  var ProposalView = Backbone.View.extend({
    initialize: function (options) {
      var self = this;
      _.bindAll(this,"render","updateAuthors","verifySponsorEmail","updateSponsorInfo","updateAuthorList");
      _(this).extend(_(options).pick("student","other_students","users"));

      this.facultyView = options.facultyView || false;
      this.other_authors = new UserList();
      _(this.model.get("other_authors")).each(function(fc){
         self.other_authors.add(options.users.findWhere({falconkey:fc}));
      });
      if(!this.model.isNew()){
        // fetch the info about the sponsor.
        $.ajax({url: settings.top_dir + "/sponsors/"+this.model.get("sponsor_id"),
          type: "GET", success: this.updateSponsorInfo});
      }
      this.model.on({
        sync: function(){
          self.$(".submit-proposal-button").button("saved").attr("disabled","disabled");
        },
        change: function () {
          self.$(".submit-proposal-button").button("reset").attr("disabled",false);
        },
        "change:to_be_judged change:use_animal_subjects change:use_human_subjects": function(){
            self.unstickit(this.model); self.stickit(this.model,this.bindings);
        }
      });
    },
    render: function (){
      var self = this;
      Backbone.Validation.bind(this, {
        invalid: function(view, attr, error) {
          $(_(view.bindings).invert()[attr]).closest(".form-group").addClass("has-error")
          .popover({title: "Error", content: error, placement: "auto top"}).popover("show");
        },
        valid: function(view, attr, error) {
          $(_(view.bindings).invert()[attr]).closest(".form-group").removeClass("has-error").popover("hide");
        }
      });

      this.$el.html($("#proposal-view").html());
      if(this.facultyView){
        this.$("input,.presentation-type,.proposal-text,.add-author-button").each(function(i,v){ $(v).prop("disabled",true)});
        this.$(".sponsor-row").removeClass("hidden");
        this.$(".submit-proposal-button").text("Submit Sponsor Statement");
      }
      this.$("#other-equip-help").popover({html: true, placement: "left",
      content: this.$("#other-equip-help-text").html()});
      this.stickit(this.student,this.student_bindings);
      this.stickit();
      this.$(".submit-proposal-button").button();

      if(!this.model.isNew()){
        // change the button to "Update Proposal"
        this.$("button.submit-proposal-button").html("Update Proposal");
      }
      this.updateAuthorList();
    return this;
  },
  events: {
    "click button.submit-proposal-button": "submit",
    "click button.add-author-button": "updateAuthors",
    "click button.show-feedback-btn": "showFeedback",
    "blur .sponsor-email": "checkSponsorEmail",
    "hidden.bs.modal #additional-author-modal": "addAuthor",
  },
  student_bindings: {
    ".author-name": { observe: ['first_name', 'last_name'],
    onGet: function(values){
      return values[0] + " " + values[1];
    }},
    ".author-email": "email",
  },
  sponsor_bindings: {
    ".sponsor-name": {
      observe: ["first_name","last_name"],
      onGet: function(vals){
        return vals[0]+" "+vals[1];
      }
    },
    ".sponsor-email": "email",
    ".sponsor-dept": "department"
  },
  bindings: {
    ".title": "title",
    ".presentation-type": "type",
    ".human-subjects": "use_human_subjects",
    ".human-subjects-number": {
      observe: "human_subjects_number", update: function($el, val, model, options) {
        if(model.get("use_human_subjects")){
          this.$(".human-subjects-number").closest(".form-group").removeClass("hidden")
        } else {
          this.$(".human-subjects-number").closest(".form-group").addClass("hidden")
        }
      }
    },
    ".animal-subjects": "use_animal_subjects",
    ".animal-subjects-number": {
      observe: "animal_subjects_number", update: function($el, val, model, options) {
        if(model.get("use_animal_subjects")){
          this.$(".animal-subjects-number").closest(".form-group").removeClass("hidden")
        } else {
          this.$(".animal-subjects-number").closest(".form-group").addClass("hidden")
        }
      }
    },
    ".presentation-type": { observe: "type",
        selectOptions: {
            collection: common.presentation_types,
            defaultOption: {label: "Choose one...", value: null}
        }
    },
    ".to-be-judged": "to_be_judged",
    ".contact-phone": {
      observe: "contact_phone",
      update: function($el,val,model,option){
        if(model.get("to_be_judged")){
          this.$(".contact-div").removeClass("hidden")
        } else {
          this.$(".contact-div").addClass("hidden")
        }
      }
    },
    ".proposal-text": "content",
    ".sponsor-statement": {observe: "sponsor_statement", events: ["blur"]},
  },
  submit: function (){
    var self = this;
    this.$(".submit-proposal-button").button("saving")
    this.model.save(this.model.attributes,{success: function(){
      location.href=settings.template_dir +"/submitted/"+self.model.get("_id");
//      $.ajax(settings.top_dir +"/proposals/"+self.model.get("_id"),{contentType: false});
    }});
  },
  updateAuthors: function() {
    var self = this;
    this.addAuthorsView = new AdditionalAuthorsView({el: $("#main-modal"),
      model: this.model,other_authors: this.other_authors}).render();
    this.addAuthorsView.$(".modal").modal("show");
    this.other_authors.on({
      add : this.updateAuthorList,
      remove: this.updateAuthorList
    });
  },
  updateAuthorList:function (){
    this.$(".other-authors").val(this.other_authors
      .map(function(auth) { return auth.get("first_name") + " " + auth.get("last_name");}).join(", "));
  },
  addAuthor: function (){
    this.model.save({success: function () {
      this.model.trigger("change:other_authors",this.model);
    }});
  },
  checkSponsorEmail: function (){
    console.log("in checkSponsorEmail");
    var sp_email = this.$(".sponsor-email").val();

    var FSUemailRE = /^(\w+)@fitchburgstate.edu$/;
    var match = FSUemailRE.exec(sp_email);
    if(match){
      $.ajax({url: settings.top_dir + '/users/'+match[1]+"/check",
      type: "GET", success: this.verifySponsorEmail});
    } else {
      this.verifySponsorEmail({});
    }
  },
  updateSponsorInfo: function(data){
    this.sponsor = new Sponsor(data);
    this.stickit(this.sponsor,this.sponsor_bindings);
  },
  verifySponsorEmail: function (data) {
    if(_(data).isEqual({})){
      this.$(".sponsor-email").closest(".form-group").addClass("has-error");
      this.$(".sponsor-email").popover({placement: "top",content: "Email address was not found."}).popover("show");
    } else {
      this.$(".sponsor-email").closest(".form-group").removeClass("has-error");
      this.$(".sponsor-email").popover("hide");
      this.model.set({sponsor_id: data._id});
    }
  }
});


var AdditionalAuthorsView = Backbone.View.extend({
  initialize: function (options){
    var self = this;
    _.bindAll(this,"render","updateAuthorList","updateView");
    this.other_authors = options.other_authors;
    this.other_authors.on({add: this.updateView, remove: this.updateView});
    this.other_authors.on({
      add: function(_author){
        var _the_authors = self.model.get("other_authors");
        _the_authors.push(_author.get("falconkey"));
        self.model.set("other_authors",_the_authors);
      },
      remove: function(_author){
        var _the_authors = self.model.get("other_authors");
        self.model.set("other_authors",_(_the_authors).without(_author.get("falconkey")));
      }
    });
    this.addAuthor = new Student();
  },
  render: function(){
    var self = this;
    this.$el.html($("#add-author-template").html());
    this.updateView();
    this.stickit(this.addAuthor,this.bindings);
    return this;
  },
  bindings: {"input#add-author-field": "email"},
  events: {
    "click button.add-author-btn": "addAuthor",
    "click update-author-button": "saveAuthors",
    "click button.delete-btn": "removeAuthor"
},
updateView: function (){
  var self = this;
  var ul = this.$(".author-list").html("");
  var all_authors = this.other_authors.pluck("falconkey");
  this.model.set("other_authors",all_authors);
  this.other_authors.each(function(author){
    ul.append("<li>" + author.get("first_name") + " " + author.get("last_name")
           + "<button class='btn btn-default delete-btn btn-sm' data-id='"
          + author.get("_id") + "'>Remove</button>");
    //ul.append(new AuthorRowView({model: author, authors: self.model.get("other_authors")}).render().el);
  });
},
removeAuthor: function(evt){
  var _id = $(evt.target).attr("data-id");
  this.other_authors.remove(_id)
  this.updateView;
},
addAuthor: function (){
  var emailRE = /^(\w+)@student.fitchburgstate.edu$/;
  var match = emailRE.exec(this.addAuthor.get("email"))
  var falconkey = match ? match[1]: this.addAuthor.get("falconkey");
  if(falconkey != "") {
    $.ajax({url: settings.top_dir + "/users/"+falconkey+"/check",
      type: "GET", success: this.updateAuthorList});
  } else {
    this.updateAuthorList({});
  }
},
updateAuthorList: function (data) {
  if(_.isEqual(data,{})){ // the email address didn't exist
  console.log("The falconkey does not exist");
  this.$("input#add-author-field").closest(".form-group").addClass("has-error");
  this.$("input#add-author-field").popover({content: "The email does not exist"}).popover("show")

} else {
  if(! this.other_authors.findWhere({email: data.email})){
    this.other_authors.add(new Student(data));
    this.addAuthor.clear();
  }
}
}
});

return ProposalView;

});
