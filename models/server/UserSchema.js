function make(Schema, mongoose) {
	var UserSchema = new Schema({
		user_id: String,
	    first_name: String,
		last_name: String,
		type: String,
		proposal: Buffer,
		submissionDate: Date,
	});

	var User = mongoose.model("user",UserSchema);

	return User;

}

module.exports.make = make;