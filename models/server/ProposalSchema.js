function make(Schema, mongoose) {
	var ProposalSchema = new Schema({
	    user_id: String,
	    type: String,
		proposal: Buffer,
		submissionDate: Date,
		sponsor_statement: Buffer
	});

	var Proposal = mongoose.model("Proposal",ProposalSchema);


}

module.exports.make = make;