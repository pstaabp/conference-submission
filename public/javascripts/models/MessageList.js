define(['Backbone', 'underscore','./Message'], function(Backbone, _,Message){
    var MessageList = Backbone.Collection.extend({
        model: Message
    });

    return MessageList;
});