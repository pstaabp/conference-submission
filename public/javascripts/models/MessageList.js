define(['backbone', 'models/Message'], function(Backbone, Message){
    var MessageList = Backbone.Collection.extend({
        model: Message
    });

    return MessageList;
});