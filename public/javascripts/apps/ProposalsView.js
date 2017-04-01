define(['backbone','views/CollectionTableView', 'stickit'],function(Backbone,CollectionTableView){

  var ProposalsView = Backbone.View.extend({
    initialize: function(options){
      var self = this;
      _.bindAll(this, "render");
      this.rowTemplate = $("#proposal-template").html();
      this.proposals = options.proposals;
      // this.proposals.on("remove",function(_prop){
      //   console.log(_prop);
      //
      // });
      this.proposals.on("change:sponsor_statement change:sponsor_name change:sponsor_dept",function(model){
        model.save();
      });
      this.users = options.users;
      this.extended_proposals = new Backbone.Collection();
      this.proposals.each(function(_prop){
        var _author = self.users.findWhere({_id: _prop.get("author_id")});
        var extended_prop = _prop.clone();
        extended_prop.set("author",_author.get("first_name")+ " " + _author.get("last_name"));
        self.extended_proposals.add(extended_prop);
      });
      // probably need to track changes to the original proposal.

      // this is used for the stickit select options below.
      this.judgeList = options.judges.chain()
        .sortBy(function(judge){ return judge.get("name");})
        .map(function(judge){ return {name: judge.get("name"), id: judge.id};}).value();
    },
    render: function(){
      var self = this;
      this.$el.html($("#proposals-tab-template").html());
      var table = this.$(".proposals-table tbody");
      this.tableSetup();
      this.proposalsTable = new CollectionTableView({columnInfo: this.cols, collection: this.extended_proposals,
        paginator: {page_size: 15, button_class: "btn btn-default", row_class: "btn-group"}});
        this.proposalsTable.render().$el.addClass("table table-bordered table-condensed");
        this.$('.proposals-table-container').html(this.proposalsTable.el);
        this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
      },
      events: {
        "keyup #proposal-search-box": "search",
        "click .clear-search-proposal": "clearSearch"
      },
      showHideProposal: function ($el,_model,target) {
        if(target.text()==="Show"){
          target.text("Hide");
          $el.parent().siblings(".proposal-detail-row").each(function(i,v){
            $(v).prev().children(".show-proposal").children("button").text("Show");
            $(v).remove();
          })
          $el.parent().after(new ProposalDetailView({model: _model, users: this.users, hidden: true}).render().el);
          $el.parent().siblings(".proposal-detail-row").show("blind",250);

        } else {
          target.text("Show");
          $el.parent().siblings(".proposal-detail-row").hide("blind",450, function(){
            $el.parent().siblings(".proposal-detail-row").remove();
            $el.parent().parent().find(".ui-effects-wrapper").remove();  // this thing still was there and messed up the table.

          })
        }

      },
      tableSetup: function(){
        var self = this;
        var roleTemplate = _.template($("#role-template").html());
        this.cols = [
          {name: "Show", key: "show_proposal", classname: "show-proposal",
          stickit_options: {update: function($el, val, model, options) {
            $el.html($("#show-button-template").html());
            $el.children(".btn").on("click",function(evt) {
              self.showHideProposal($el,model,$(evt.target));
            });
          }}},
          {name: "Accepted", key: "accepted", classname: "accepted", editable: true, datatype: "boolean"},
          {name: "Session", key: "session", classname: "session", editable: false, datatype: "string"},
          {name: "Main Author", key: "author", classname: "author", editable: false, datatype: "string",
          sort_function: function(author){
            var names = author.split(" ");
            return names[names.length-1].toLowerCase();
          }},
          {name: "Proposal Title", key: "title", classname: "title", additionalClass: "col-md-6", editable: true, datatype: "string"},
          {name: "Proposal Type", key: "type", classname: "type", editable: false, datatype: "string"}
        ];
      },
      search: function(evt){
        this.proposalsTable.filter($(evt.target).val());
        this.proposalsTable.render();
        this.$('.num-proposals').text("There are " + this.proposalsTable.filteredCollection.length
        + " of " + this.proposals.size()
        + " proposals shown.");
      },
      clearSearch: function(evt){
        this.$("#proposal-search-box").val("");
        this.proposalsTable.filter("");
        this.proposalsTable.render();
        this.$('.num-proposals').text("There are " + this.proposals.size() + " proposals shown.");
      }

    });

    var ProposalDetailView = Backbone.View.extend({
      tagName: "tr",
      className: "proposal-detail-row",
      initialize: function (options){
        var self = this;
        _(this).bindAll("deleteProposal");
        _(this).extend(_(options).pick("users"));

        if(options.hidden){
          this.$el.css("display","none");
        }
        this.author = this.users.findWhere({_id: this.model.get("author_id")});
        this.sponsor = this.users.findWhere({_id: this.model.get("sponsor_id")});
      },
      render: function(){
        this.$el.html($("#proposal-details-template").html());
        this.stickit();
        this.stickit(this.sponsor,this.sponsor_bindings);
        this.stickit(this.author,this.author_bindings);
        return this;
      },
      author_bindings: {
        ".grad-year": "grad_year",
        ".presented-before": "presented_before"
      },
      sponsor_bindings: {
        ".sponsor-name": {
          observe: ["first_name","last_name"],
            onGet: function(vals){ return vals[0]+ " " + vals[1];}},
        ".sponsor-email": "email",
        ".sponsor-dept": "department",
      },
      bindings: {
        ".accepted": "accepted",
        ".session": "session",
        ".type": "type",
        ".title": "title",
        ".submitted-date": "submit_date",
        ".use-human-subjects": "use_human_subjects",
        ".use-animal-subjects": "use_animal_subjects",
        ".proposal-content": "content",
        ".sponsor-statement": "sponsor_statement",
        ".human-subjects-number": "human_subjects_number",
        ".animal-subjects-number": "animal_subjects_number",
        ".judges": {observe: "feedback", onGet: function(feedbackList){
          feedbackList.map(function(feed){
            return feed.get("judge_id");
          }).join(", ");
        }},

        ".other-authors": {
            observe: "other_authors",
            onGet: function(val){
              var self = this;
              return _(val).map(function(fk){
                  var _user = self.users.findWhere({falconkey: fk});
                  return _user.get("first_name") + " " + _user.get("last_name");
              })
            }
        }
      },
      events: {"click .delete-proposal": "deleteProposal"},
      deleteProposal: function (){
        var del = confirm("Do you want to delete the proposal entitled: " + this.model.get("title"));
        if(del){
          this.model.destroy();
          this.$el.prev().remove();
          this.$el.remove();
        }
      }
    });


    var FeedbackView = Backbone.View.extend({
      initialize: function (options){
        _.bindAll(this,"render","newFeedback");
        this.judgeList = options.judgeList;
        this.proposal = options.proposal;
      },
      render: function() {
        var self = this;
        this.$el.html($("#feedback-tabs").html());
        this.proposal.get("feedback").each(function(feed,i){
          var linkName = self.proposal.id  + "j" + (i+1);
          this.$(".feedback-tabs").append(_.template($("#feedback-tab").html(),{tabID: linkName, judgeNum: (i+1)}));
          this.$(".feedback-tab-content").append((new FeedbackItemView({num: (i+1), tabID: linkName,
            model: feed, judgeList: self.judgeList, proposal: self.proposal})).render().el);
          });

          this.$("ul.feedback-tabs li:eq(0)").addClass("active");
          this.$(".feedback-tab-content .tab-pane:eq(0)").addClass("active");

        },
        events: {"click .new-feedback-btn": "newFeedback",
        "click .feedback-tabs a": "showTab"},
        newFeedback: function (){
          this.proposal.get("feedback").add(new Feedback());
          this.render();
          this.$('.feedback-tabs a:last').tab('show');
        },
        // Not sure why this is needed.  This is perhaps because it is generated dynamically.
        showTab: function(evt){
          evt.preventDefault();
          $(this).tab('show');
        }
      });

      var FeedbackItemView = Backbone.View.extend({
        tagName: "div",
        className: "tab-pane",
        initialize: function (){
          var self = this;
          _.bindAll(this,"render","saveFeedback");
          this.judgeList = this.options.judgeList;
          this.proposal = this.options.proposal;
          this.invBindings = _.invert(_.extend(_.omit(this.bindings,".judge"),{".judge": "judge_id"}));
        },
        render: function (){
          var self = this;
          this.$el.attr("id", this.options.tabID);
          this.$el.html($("#feedback-edit-template").html());
          backbone.Validation.bind(this);
          this.stickit();
          return this;
        },
        bindings: {".judge": {
          observe: "judge_id",
          selectOptions: { collection: "this.judgeList", labelPath: "name", valuePath: "id",
          defaultOption: { label: 'Choose one...',  value: null },
        }
      },
      ".visual-design": "visual_design",
      ".knowledge": "knowledge",
      ".verbal-presentation": "verbal_presentation",
      ".explanations": "explanations",
      ".organization-and-logic": "organization_and_logic",
      ".overall": "overall",
      ".strength": "strength_comment",
      ".improvement": "improvement_comment"
    },
    events: {"click .save-feedback-button": "saveFeedback"},
    saveFeedback: function (){
      var self = this;
      var errors = this.model.validate();
      if(errors){
        _(errors).chain().keys().each(function(attr){
          self.$(self.invBindings[attr]).popover({content: errors[attr]}).popover("show").addClass("error");
        });
      } else {
        this.$(".error").removeClass("error");
        this.proposal.save();
      }
    }
  });







  return ProposalsView;

});
