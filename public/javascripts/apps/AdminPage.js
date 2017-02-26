// make sure that require-config.js is loaded before this file.
define(['module','jquery','backbone', 'underscore','apps/common',
'models/UserList','models/User','models/ProposalList',
'models/Proposal',"models/Judge","models/JudgeList","apps/UsersView",
'apps/ProposalsView', 'apps/PresentationsView', 'apps/SponsorsView',
'apps/JudgesView', 'apps/JudgeScheduleView', 'apps/EmailView', 'apps/AllFeedbackView',
'views/WebPage','bootstrap'],
function(module,$, Backbone, _,common, UserList,User,ProposalList,Proposal,Judge,
  JudgeList,UsersView, ProposalsView, PresentationsView,
  SponsorsView, JudgesView, JudgeScheduleView, EmailView, AllFeedbackView,WebPage){
    var AdminPage = WebPage.extend({
      tabs: {
        usersView: "#users",proposalsView: "#proposals",
        judgesView: "#judges", judgeScheduleView: "#judge-schedule",
        emailView: "#emails", feedbackView: "#feedback",
        sponsorsView: "#sponsors", presentationsView: "#presentations"
      },
      initialize: function () {
        WebPage.prototype.initialize.apply(this, {el: this.el});

        _.bindAll(this, 'render','updateUser','syncUser');  // include all functions that need the this object
        var self = this;
        this.proposals = (module.config())? new ProposalList(module.config().proposals,{parse: true}) : new ProposalList();
        this.users = (module.config())? new UserList(module.config().users) : new UserList();
        this.judges = (module.config()) ? new JudgeList(module.config().judges) : new JudgeList();

        this.proposals.on({
          add: this.render,
          sync: function(_prop){
            self.messagePane.addMessage({short:"The proposal for " + _prop.get("author") +
            " was saved.", type: "success"});
          },
          remove: function(_prop){
            self.messagePane.addMessage({short: "A proposal for " + _prop.get("author") + " was deleted."});
          }});

          this.views = {
            usersView : new UsersView({users: this.users, proposals: this.proposals,
              rowTemplate: "#user-row-template"}),
              proposalsView : new ProposalsView({
                users: this.users,proposals: this.proposals,
                judges: this.judges
              }),
              presentationsView: new PresentationsView({parent: this,users: this.users}),
              judgesView : new JudgesView({judges: this.judges, proposals: this.proposals}),
              judgeScheduleView : new JudgeScheduleView({proposals: this.proposals, judges: this.judges}),
              emailView : new EmailView({users: this.users, proposals: this.proposals, judges: this.judges}),
              feedbackView: new AllFeedbackView({proposals: this.proposals, judges: this.judges}),
              sponsorsView: new SponsorsView({users: this.users})
            }

          this.users.on({change: this.updateUser,sync: this.syncUser});
          this.judges.on({change: this.updateUser,sync: this.syncUser});
          this.render();
        },
        events: {
          "shown.bs.tab #admin-tabs a[data-toggle='tab']": "changeView"
        },
        render: function () {
          var self = this;
          WebPage.prototype.render.apply(this);  // Call  WebPage.render();
          this.$el.append(_.template($("#admin-tabs-template").html()));

          _(this.tabs).chain().keys().each(function(tab){
            self.views[tab].setElement(self.$(self.tabs[tab]));
          });



          var userNames = _(this.users.sortBy(function(user) { return user.get("last_name");}))
          .map(function(user) { return {id: user.get("_id"), name: user.get("first_name") + " " + user.get("last_name")}});

          $("#act-as-user").removeAttr("style").html(_($("#act-as-user-template").html()).template({users: userNames}));

          this.views.usersView.render();
        },
        actAsUser: function(evt){
          console.log($(evt.target).data("id"));
        },
        changeView: function(evt){
          var viewName =$(evt.target).data("view");
          this.views[viewName].render();
          if(viewName==="postersView"){
            this.setSortable();
          }
        },
        updateUser: function(_user){
          console.log(_user.changed);
          _user.changingAttributes=_.pick(_user._previousAttributes,_.keys(_user.changed));
          _user.save();
        },
        syncUser: function(_user){
          var self = this;
          _(_.keys(_user.changingAttributes||{})).each(function(key){
            self.messagePane.addMessage({type: "success",
            short: "User Saved",
            text: "Property " + key + " for " + _user.get("first_name") + " " + _user.get("last_name") + " has "
            + "changed from " + _user.changingAttributes[key] + " to " + _user.get(key) + "."});
          });
        }
      });


          new AdminPage({el: $("#content")});
        });
