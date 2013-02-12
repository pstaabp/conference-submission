define(['Backbone'], function(Backbone){
    
    var common = {
    	logout: function (evt) {
		    evt.preventDefault();
		    if (confirm('Are you sure you want to log out?')) {
		      var element = $(this),
		          form = $('<form></form>');
		      form.attr({method: 'POST',action: '/sessions'})
        		  .hide()
        		  .append('<input type="hidden" />')
        		  .find('input')
        		  .attr({'name': '_method','value': 'delete'})
        		  .end()
        		  .appendTo('body')
                  .submit();
    		}
    		return false;
        }
    }

    return common;

});
