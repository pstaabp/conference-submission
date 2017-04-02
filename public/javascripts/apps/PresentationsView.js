define(['backbone','models/ProposalList','stickit','jquery-truncate','jquery-ui'], function(Backbone,ProposalList){
  var PresentationsView = Backbone.View.extend({
    initialize: function(options){
      _.bindAll(this, "render");
      _(this).extend(_(options).pick("users","proposals"));
    },
    render: function() {
      var _proposals;
      var _view;
      switch($("input[type='radio'][name='presentationsview']:checked").val()){
        case "orals":
          _proposals = this.proposals.where({type: "Oral Presentation"});
          _view = new PresentationView({type: "Orals", proposals: _proposals, users: this.users});
        break;
        case "schedule":
          _proposals = this.proposals.where({type: "Oral Presentation"});
          _view = new OralPresentationScheduleView({parent: this, proposals: _proposals,users: this.users});
        break;
        case "posters":
          _proposals = this.proposals.where({type: "Poster Presentation"});
          _view = new PostersView({proposals: _proposals,users: this.users});
        break;
        case "videos":
          _proposals = this.proposals.where({type: "Video"});
          _view = new PresentationView({type: "Video", proposals: _proposals,users: this.users});
        break;
        case "art2d":
          _proposals = this.proposals.where({type: "Art (2D)"});
          _view = new PresentationView({type: "2D Art", proposals: _proposals, users: this.users});
        break;
        case "art3d":
          _proposals = this.proposals.where({type: "Art (3D)"});
          _view = new PresentationView({type: "3D Art", proposals: _proposals, users: this.users});
        break;
        case "music":
          _proposals = this.proposals.where({type: "Music"});
          _view = new PresentationView({type: "Music", proposals: _proposals, users: this.users});
        break;
        case "theatre":
          _proposals = this.proposals.where({type: "Theatre"});
          _view = new PresentationView({type: "Theatre", proposals: _proposals,users: this.users})
        break;
      }
      this.$(".presentation-content").html(_view.render().el);
    },
    events: {"change input[name='presentationsview']": "render"}

  });


  var OralPresentationScheduleView = Backbone.View.extend({
    template: _.template($("#schedule-template").html()),
    prop_template: _.template($("#oral-presentation-template").html()),
    initialize: function(opts){
      _.bindAll(this,"render","reorder");
      _(this).extend(_(opts).pick("parent","users"));
      this.proposals = new ProposalList(opts.proposals);
      this.proposals.sortBy('session');
    },
    render: function (){
      var self = this;
      var sessionNames = "ABCDEFGHIJKL";

      this.$el.html(this.template({numSessions: 12 }));

      var re = /OP-(\d+)-(\d+)/;

      this.proposals.each(function(prop){
        var matches = prop.get("session").match(re);
        var _student = self.users.findWhere({_id: prop.get("author_id")});
        var propHTML = self.prop_template(_(prop.attributes)
                .extend({cid: prop.cid,author:_student.get("first_name")+ " " + _student.get("last_name")}));
        if(matches){
          self.$("ul#col" + matches[1]).append(propHTML);
        } else {
          self.$("#extra-ops").append(propHTML);
        }


      });

      this.$(".oral-present-col").sortable({
        connectWith: ".oral-present-col",
        placeholder: "ui-state-highlight",
        update: this.reorder});

        //this.$(".op-title").truncate();
        return this;

      },
      reorder: function (evt,ui){
        var destinationSession = $(ui.item).parent().attr('id').split("col")[1];
        var exec = /OP-(\d+)-(\d+)/.exec($(ui.item).data("original-session"));
        var originalSession = exec? exec[1]: null ;
        var self = this;
        $("#col"+ destinationSession + " li,#col" + originalSession + " li").each(function(i,item){
          var cid = $(item).attr("id")
          var proposal = self.proposals.find(function(prop) { return prop.cid===cid;})
          var list = parseInt($(item).parent().attr("id").split("col")[1]);
          $(item).sortable({
            connectWith: ".oral-present-col",
            placeholder: "ui-state-highlight",
            update: this.reorder});

            proposal.set("session","OP-"+list + "-"+$(item).index());
            proposal.save();
          });
        }
      });

      var PostersView = Backbone.View.extend({
        initialize: function(options){
          _.bindAll(this, "render");
          this.rowTemplate =  _.template($("#presentation-row-template").html());
          this.proposals = options.proposals;
          this.users = options.users;
        },
        render: function (){
          var self = this;
          this.$el.html($("#presentation-table-template").html());
          var posterTable = this.$("table tbody");
          _(this.proposals).each(function(proposal,i){
            var _student = self.users.findWhere({_id: proposal.get("author_id")});
            if(proposal.get("session")===""){
              proposal.set({session: "P"+ (i<9?"0"+ (i+1): (i+1))});
            }
            var row = new PresentationRowView({model: proposal, rowTemplate: self.rowTemplate,
              student: _student, reorder: true}).render();
            row.$el.addClass("poster-row");
            posterTable.append(row.el);
          });


          this.$("table").sortable({
            axis: "y",
            items: "tr.poster-row",
            // handle: "tr.poster-row button",
            update: function( event, ui ) {
              console.log("I was sorted!!");
              self.$(".poster-row").each(function(i,prop){
                var cid = $(prop).attr("id");
                var updateProp = _(self.proposals).find(function(proposal) { return proposal.cid === cid;})
                var sess = "P" + ( (i<9)? "0"+(i+1): ""+(i+1));
                if (sess !== updateProp.get("session")){

                  updateProp.set("session",sess);
                  updateProp.save();

                  $(prop).find(".session .srv-value").text(sess);
                }
              });
            }
          });

          return this;
        }
      });

      var PresentationRowView = Backbone.View.extend({
        tagName: "tr",
        className: "presentation-row",
        initialize: function (opts){
          _.bindAll(this, "render","showHideDetails");
          _(this).extend(_(opts).pick("reorder","student","sponsor","rowTemplate"));
          this.model.on("change:session",this.render);
        },
        render: function(){
          this.$el.html(this.rowTemplate({reorder: this.reorder}));
          this.$el.attr("id",this.model.cid);
          this.stickit();
          this.stickit(this.student,this.user_bindings);
          return this;
        },
        events: {
          "click button.showDetails": "showHideDetails"
        },
        user_bindings: {
          ".author": {
            observe: ["first_name","last_name"],
            onGet: function(vals) {
              return vals[0] + " " + vals[1];
            }
          }
        },
        bindings: {
          ".title": "title",
          ".session": "session"
        },
        showHideDetails: function (evt){
          if($(evt.target).text()==="Show Details"){
            $(evt.target).text("Hide Details");
            this.$el.after(new PresentationDetailView({model: this.model,author: this.student, sponsor: this.sponsor}).render().el);
          } else {
            $(evt.target).text("Show Details");
            this.$el.next().remove();
          }
        }
      });

      var PresentationView = Backbone.View.extend({
        initialize: function(opts){
          _.bindAll(this, "render");
          this.rowTemplate =  _.template($("#presentation-row-template").html());
          _(this).extend(_(opts).pick("proposals","type","users"));
        },
        render: function (){
          var self = this;
          this.$el.html($("#presentation-table-template").html());
          var table = this.$("table tbody");
          _(this.proposals).each(function(proposal){
            var _student = self.users.findWhere({_id: proposal.get("author_id")});
            var _sponsor = self.users.findWhere({_id: proposal.get("sponsor_id")});
            table.append((new PresentationRowView({model: proposal,
              rowTemplate: self.rowTemplate, sponsor: _sponsor,
              student: _student,reorder: false })).render().el);
            });
            return this;
          }
        });

        var PresentationDetailView = Backbone.View.extend({
          tagName: "tr",
          className: "presentation-detail-row",
          initialize: function(opts){
            _(this).extend(_(opts).pick("author","sponsor"));
          },
          render: function(){
            var row = $("<td colspan='5'></td>");
            row.html($("#presentation-details-template").html());
            this.$el.html(row);
            this.$el.data("id",this.model.id);
            this.stickit();
            this.stickit(this.author,this.author_bindings);
            this.stickit(this.sponsor,this.sponsor_bindings);
            return this;
          },
          author_bindings: {
            ".author": {
              observe: ["first_name","last_name"],
              onGet: function(vals) {
                return vals[0] + " " + vals[1];
              }
            }
          },
          sponsor_bindings: {
            ".sponsor-name": {
              observe: ["first_name","last_name"],
              onGet: function(vals) {
                return vals[0] + " " + vals[1];
              }
            },
            ".sponsor-email": "email",
            ".sponsor-dept": "department",
          },
          bindings: {
            ".accepted": "accepted",
            ".session": "session",
            ".type": "type",
            ".title": "title",
            ".use-human-subjects": "use_human_subjects",
            ".use-animal-subjects": "use_animal_subjects",
            ".proposal-content": "content",
            ".sponsor-statement": "sponsor_statement"
        },
      });




      return PresentationsView;

    });
