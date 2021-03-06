
define(['module','backbone', 'underscore','models/Student','models/ProposalList',
    'views/StudentInfoView','views/ProposalView','models/Proposal','views/WebPage','models/UserList'],
function(module,Backbone, _, Student,ProposalList,StudentInfoView,ProposalView,Proposal,WebPage,UserList){

    var StudentPage = WebPage.extend({
        el: "#content",
        initialize: function () {
            WebPage.prototype.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render','updateInfo');  // include all functions that need the this object
            var self = this;

            this.student = module && module.config() ? new Student(module.config().student): new Student();
            this.proposals = module && module.config() ? new ProposalList(ProposalList.prototype.parse(module.config().proposals))
                     : new ProposalList();
            this.users = module && module.config() ? new UserList(module.config().users): new UserList();
            this.proposals.user_id = this.student.get("falconkey");
            this.proposals.on("add",function (){
                self.render();
                $("#submit-main-tabs a:last").tab("show");
            }).on("sync",function(_proposal){
                self.messagePane.addMessage({short: "Proposal Saved.", type: "success"});
            });
            this.student.on({
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
            if (this.student) {
                this.personalInfoView = new StudentInfoView({el: $("#personal"), student: this.student,
                  proposals: this.proposals, editMode: false});
                if (this.student.get("role")!=="student"){
                    $("#submit-proposal-row").addClass("hidden");
                }
            }
            this.proposalViews = [];
            this.proposals.each(function(prop,i){
                $("#submit-main-tabs").append("<li><a href='#prop" + (i+1) +"'' data-toggle='tab'>Proposal #" + (i+1) + "</a></li>");
                $(".tab-content").append("<div class='tab-pane' id='prop"+ (i+1)+ "'></div>")
                self.proposalViews.push(new ProposalView({model: prop,
                      el: $("#prop"+(i+1)), student: self.student,
                      users: self.users}).render());
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
