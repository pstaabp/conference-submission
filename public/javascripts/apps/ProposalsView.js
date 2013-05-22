define(['Backbone','./common','../views/EditableCell'], function(Backbone,common,EditableCell){

    var ProposalsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, "render","sortProposals");
            this.rowTemplate = $("#proposal-row-template").html();
            this.proposals = this.options.proposals;
            this.proposals.on("remove",this.render);
        },
        render: function(){
            var self = this;
            this.$("tbody").html("");
            this.proposals.each(function(proposal){
                self.$(".proposal-table > tbody").append((new ProposalRowView({model: proposal, rowTemplate: self.rowTemplate})).render().el);
            });
        },
        events: {"change input.sortable": "sortProposals"},
        sortProposals: function(evt){
            this.proposals.sortField = $(evt.target).val();
            this.proposals.sort();
            this.render();
        }
    });


    var ProposalRowView = Backbone.View.extend({
        tagName: "tr",
        className: "proposal-row",
        initialize: function(){
            _.bindAll(this,"render","deleteProposal","changeAcceptedStatus");
            this.rowTemplate = this.options.rowTemplate;

        },
        render: function() {
            var self = this;
            if(!this.model) { return this; }

            var subDate = (new XDate(this.model.get("submit_date"))).toLocaleDateString();
            var subTime = (new XDate(this.model.get("submit_date"))).toLocaleTimeString();

            //this.$el.html(_.template($("#proposal-row-template").html(),_.extend(this.model.attributes,{date: subDate, time: subTime})));
            this.$el.html(this.rowTemplate);
            this.$el.attr("id",this.model.cid);
            //this.$(".accepted-checkbox").prop("checked",this.model.get("accepted"));
            //if(this.model.get("accepted")){this.$("table").removeClass("not-accepted");}
            //_(common.proposalParams).each(function(prop){
            //    self.$(prop.class).html((new EditableCell({model: self.model, property: prop.field})).render().el);    
            //})
            this.stickit();
            return this;
        },
        events: {"click .delete-proposal": "deleteProposal",
                 "dblclick .proposal-content": "editContent",
                 "change .edit-content": "saveContent",
                 "focusout .edit-content": "closeContent",
                 "change input[type='checkbox']": "changeAcceptedStatus",
                 },
        bindings: {".accepted": "accepted",
                ".author": "author",
                ".session": "session",
                ".type": "type",
                ".title": "title",
                ".sponsor-name": "sponsor_name",
                ".sponsor-email": "sponsor_email",
                ".sponsor-dept": "sponsor_dept",
                ".use-human-subjects": "use_human_subjects",
                ".use-animal-subjects": "use_animal_subjects",
                ".proposal-content": "content",
                ".sponsor-statement": "sponsor_statement"},
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