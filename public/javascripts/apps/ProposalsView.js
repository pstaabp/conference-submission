define(['Backbone','./common','../views/EditableCell'], function(Backbone,common,EditableCell){

    var ProposalsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render");
            this.template = $("#proposals-template").html();
            this.parent = this.options.parent;
            this.type = this.options.type;
            this.getProposals = {
                "allProposals": this.parent.getProposals, "orals": this.parent.getOrals, 
                "posters": this.parent.getPosters, "2dart": this.parent.get2DArt, "3dart": this.parent.get3DArt,
                "videos": this.parent.getVideos
            };

            this.headers = {allProposals: "Proposals", orals: "Oral Presentations", posters: "Poster Presentations",
                            "2dart": "Two-Dimensional Art", "3dart": "Three-Dimensional Art", videos: "Videos"};

            this.parent.proposals.on("remove",this.render);
        },
        render: function(){
            var self = this;
            var proposals = this.getProposals[this.type].apply();
            this.$el.html(_.template(this.template,{propHeader: this.headers[this.type], number: proposals.length}));
            _(proposals).each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalRowView({model: proposal})).render().el);
            });
        }
    });


    var ProposalRowView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(){
            _.bindAll(this,"render","deleteProposal","changeAcceptedStatus");

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = (new XDate(this.model.get("submit_date"))).toLocaleDateString();
            var subTime = (new XDate(this.model.get("submit_date"))).toLocaleTimeString();

            this.$el.html(_.template($("#proposal-row-template").html(),_.extend(this.model.attributes,{date: subDate, time: subTime})));
            this.$el.attr("id",this.model.cid);
            this.$(".accepted-checkbox").prop("checked",this.model.get("accepted"));
            if(this.model.get("accepted")){this.$("table").removeClass("not-accepted");}
            _(common.proposalParams).each(function(prop){
                self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            })
            return this;
        },
        events: {"click .delete-proposal": "deleteProposal",
                 "dblclick .proposal-content": "editContent",
                 "change .edit-content": "saveContent",
                 "focusout .edit-content": "closeContent",
                 "change input[type='checkbox']": "changeAcceptedStatus"},

        deleteProposal: function(){
            var del = confirm("Do you wish to delete the proposal " + this.model.get("title") +"?");
            if(del){
                this.model.destroy();
            }
        },
        editContent: function(){
            var self = this;
            var content = this.$(".proposal-content").text();
            this.$(".proposal-content").html("<textarea rows='10' class='edit-content'>" + content + "</textarea>");
            this.$(".edit-content").focus();
            this.delegateEvents();
        },
        saveContent: function(){
            var newContent = this.$(".edit-content").val();
            this.model.set({content: newContent});
            this.model.save();
        
        },
        closeContent: function(){
            var content = this.$(".edit-content").val();
            this.$(".proposal-content").html(content);
        },

        changeAcceptedStatus: function(evt){
            this.model.set({accepted: $(evt.target).prop("checked")});
            this.model.save();
            if($(evt.target).prop("checked")){
                this.$("table").removeClass("not-accepted");
            } else {
                this.$("table").addClass("not-accepted");
            }
        }

    });

    return ProposalsView;

});