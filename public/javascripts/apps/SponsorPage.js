
define(['module','backbone', 'underscore',
  'models/UserList','models/User','models/ProposalList',"views/WebPage","views/SponsorInfoView",
  "views/ProposalView","apps/common",'bootstrap'],
function(module,Backbone, _, UserList, User, ProposalList,WebPage,SponsorInfoView,ProposalView,common){
  var SponsorView = WebPage.extend({
    initialize: function () {
      this.constructor.__super__.initialize.apply(this, {el: this.el});
      _.bindAll(this, 'render');  // include all functions that need the this object
      var self = this;
      this.user = module && module.config() ? new User(module.config().user): new User();
      this.proposals = module && module.config() ?
                new ProposalList(ProposalList.prototype.parse(module.config().proposals))
                : new ProposalList();
      this.users = module && module.config() ? new UserList(module.config().users): new UserList();
      this.proposals.on("sync",function(_proposal){
        self.messagePane.addMessage({short: "Proposal Saved.", type: "success"});
      });
      this.render();

    },
    render: function () {
      this.$el.html("");
      this.constructor.__super__.render.apply(this);  // Call  WebPage.render();
      var self = this;
      this.$el.append(_.template($("#faculty-tabs-template").html()));
      this.proposalViews = [];
      this.proposals.each(function(prop,i){

        var _student = self.users.findWhere({_id: prop.get("author_id")});
        $("#submit-main-tabs").append("<li><a href='#prop" + (i+1) +"'' data-toggle='tab'>Proposal #" + (i+1) + "</a></li>");

        if (prop.get("sponsor_statement")===""){
          $("a[href='#prop"+ (i+1) + "']").addClass("review-needed");
        }
        $(".tab-content").append("<div class='tab-pane' id='prop"+ (i+1)+ "'></div>")
        self.proposalViews.push(new ProposalView({model: prop, el: $("#prop"+(i+1)),
          users: self.users, student: _student, facultyView: true}).render());
      });

      $('#submit-main-tabs a:first').tab('show')


    },
    //events: {"click #submit-main-tabs a": "showTab"},
    showTab: function (evt){
      evt.preventDefault();
      $(this).tab('show');
    }
  });

  new SponsorView({el: $("#content")});
});
