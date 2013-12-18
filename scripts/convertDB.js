cursor = db.users.find();
db.users.find().forEach(function(user) {
	var falconkey = user.email.split("@")[0].toLowerCase();
	if(! user.falconkey){
		db.users.update({email: user.email},{$set: {falconkey: falconkey}});
	}
	if(typeof(user.role)!=="object"){
		db.users.update({email: user.email},{$set: {role: [user.role]}});
	}
	// remove the password and salt
	db.users.update({email: user.email},{$unset: {hashed_password:"",salt:"", reset_pass: "", temp_pass: ""}})


});
