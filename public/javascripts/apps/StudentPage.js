
define(['module','backbone', 'underscore','models/UserList','models/User','models/ProposalList',
    'views/PersonalInfoView','views/ProposalView','models/Proposal','views/WebPage'],
function(module,Backbone, _, UserList, User,ProposalList,PersonalInfoView,ProposalView,Proposal,WebPage){

    var StudentPage = WebPage.extend({
        el: "#content",
        initialize: function () {
            WebPage.prototype.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render');  // include all functions that need the this object
            var self = this;

            this.user = module && module.config() ? new User(module.config().user): new User();
            this.proposals = module && module.config() ? new ProposalList(ProposalList.prototype.parse(module.config().proposals))
                     : new ProposalList();
            this.proposals.user_id = this.user.get("falconkey");
            this.proposals.on("add",function (){
                self.render();
                $("#submit-main-tabs a:last").tab("show");
            }).on("sync",function(_proposal){
                self.messagePane.addMessage({short: "Proposal Saved.", type: "success"});
            });
            this.user.on({
                "change": function(_user){
                    _user.changingAttributes=_.pick(_user._previousAttributes,_.keys(_user.changed));
                },
                "sync": function(_user){
                _(_.keys(_user.changingAttributes||{})).each(function(key){
                    self.messagePane.addMessage({type: "success",
                        short: "User Saved",
                        text: "Property " + key + " for " + _user.get("first_name") + " " + _user.get("last_name") + " has "
                            + "changed from " + _user.changingAttributes[key] + " to " + _user.get(key) + "."});
                });
            }});
            this.render();
        },
        render: function () {
            this.$el.html("");
            WebPage.prototype.render.apply(this);  // Call  WebPage.render();
            var self = this;
            this.$el.append(_.template($("#student-tabs-template").html()));
            if (this.user) {
                this.personalInfoView = new PersonalInfoView({el: $("#personal"), user: this.user, proposals: this.proposals, editMode: false});
                if (this.user.get("role")!=="student"){
                    $("#submit-proposal-row").addClass("hidden");
                }
            }
            this.proposalViews = [];
            this.proposals.each(function(prop,i){
                $("#submit-main-tabs").append("<li><a href='#prop" + (i+1) +"'' data-toggle='tab'>Proposal #" + (i+1) + "</a></li>");
                $(".tab-content").append("<div class='tab-pane' id='prop"+ (i+1)+ "'></div>")
                self.proposalViews.push(new ProposalView({model: prop, el: $("#prop"+(i+1))}).render());
            });
        },
        updateInfo: function(){
            this.personalInfoView.save();
        },
        events: {
            "click button#submit-proposal": "newProposal",
            "click button#update-info-btn": "updateInfo"
        },
    });

    new StudentPage();
})
