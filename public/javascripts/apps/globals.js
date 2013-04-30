define(['config','underscore'], function(config) {

	console.log("in globals");
	

	var globals = { };
	_.extend(globals, config);

	console.log(globals);
	return globals;

});