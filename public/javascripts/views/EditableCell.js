define(['Backbone'],function(Backbone) {

var EditableCell = Backbone.View.extend({
        tagName: "span",
        initialize: function () {
            _.bindAll(this, 'render','editString');  // include all functions that need the this object
            _.extend(this,this.options);
        },
        render: function () {
            
            this.$el.html(this.model.get(this.property));
            this.$el.addClass("srv-value");
            
            return this;
            
        },
        events: {"dblclick": "editString",
        },
        editString: function (event) {
            console.log("in editString");
            var self = this;
            var tableCell = $(event.target);
            var currentValue = tableCell.html();
            tableCell.html("<input class='srv-edit-box' size='20' type='text'></input>");
            var inputBox = this.$(".srv-edit-box");
            inputBox.focus();
            inputBox.val(currentValue);
            inputBox.click(function (event) {event.stopPropagation();});
            this.$(".srv-edit-box").focusout(function() {
                tableCell.html(inputBox.val());
                self.model.set(self.property,inputBox.val());  // should validate here as well.  
                console.log(self.model);
                self.model.save();
                // need to also set the property on the server or 
                }); 
        },
        getValue: function ()
        {
            return this.$el.text();
        }
        
        
        });

return EditableCell;
});