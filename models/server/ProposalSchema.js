function make(Schema, mongoose) {
	var ProposalSchema = new Schema({
	    first_name: String,
		last_name: String,
		type: String,
		proposal: Buffer,
		submissionDate: Date,
	});

	var Proposal = mongoose.Model("Proposal",ProposalSchema);


});