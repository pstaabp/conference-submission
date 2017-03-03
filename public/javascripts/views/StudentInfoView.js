define(['backbone', 'underscore','apps/common','models/Proposal','bootstrap'], function(Backbone, _, common,Proposal){


  var StudentInfoView = Backbone.View.extend({
    initialize: function (options) {
      var self = this;
      this.model = options.student;
      this.proposals = options.proposals;

      this.invBindings = _(_.object(_(this.bindings).keys().map(function(key) {
        return [key, _.isObject(self.bindings[key])? self.bindings[key].observe : self.bindings[key]];}))).invert();

        Backbone.Validation.bind(this, {
          valid: function(view, attr) {
            $(self.invBindings[attr]).popover({}).popover("hide").closest(".form-group").removeClass("has-error");
          },
          invalid: function(view, attr, error) {
            $(self.invBindings[attr]).popover({content: error}).popover("show")
            .closest(".form-group").addClass("has-error");
          }
        });
        this.model.on({"sync": this.syncUser});
        this.render();
      },
      render: function (){
        this.$el.html($("#user-view").html());
        this.stickit();

      },
      createProposal: function() {
        var self = this;
        this.model.save(this.model.attributes, {success: function () {
          self.proposals.add(new Proposal({author_id: self.model.get("_id")}));
        }});

      },
      save: function (){
        this.model.save(this.model.attributes,{success:function(){
          alert("Your information has been saved. ");
        }});
      },
      events: {
        "click #save-info": "submit",
        "click button#submit-proposal": "createProposal"
      },
      bindings: {
        ".first-name": "first_name",
        ".last-name": "last_name",
        ".email": "email",
        ".grad-year": {observe: "grad_year", events: ["blur"]},
        ".presented-before": "presented_before",
        ".major": {observe: "major", selectOptions: {collection: function() {
          return common.majors;
        }, defaultOption: {label: "Select Major...", value: null}}
      }}
    });

    return StudentInfoView;

  });
