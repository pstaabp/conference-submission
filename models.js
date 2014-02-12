var crypto = require('crypto'),
    Document,
    User,
    LoginToken;

function extractKeywords(text) {
  if (!text) return [];

  return text.
    split(/\s+/).
    filter(function(v) { return v.length > 2; }).
    filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

function defineModels(mongoose, fn) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  var Feedback = new Schema({
    judge_id: String,
    visual_design: Number,
    verbal_presentation: Number,
    organization_and_logic: Number,
    knowledge: Number,
    explanations: Number,
    overall: Number,
    strength_comment: String,
    improvement_comment: String
  });

  var Person = new Schema({
    first_name: String,
    last_name: String,
    email: String
  })

 
  var Proposal = new Schema({
    author: String,
    email: String,
    author_id: String,
    other_authors: [Person],
    session: String,
    type: String,
    sponsor_email: String,
    sponsor_name: String,
    sponsor_dept: String,
    title: String,
    accepted: Boolean,
    submit_date: Date,
    content: String,
    sponsor_statement: String,
    use_human_subjects: Boolean,
    use_animal_subjects: Boolean,
    email_sent: Boolean,
    other_equipment: String,
    feedback: [Feedback]
  });

  /**
    * Model: User
    */
  function validatePresenceOf(value) {
    return value && value.length;
  }

  var User = new Schema({
    first_name: String,
    last_name: String,
    role: Array,
    major: String,
    email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    falconkey: String
  });

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.methods.getPublicFields = function () {
    var returnObject = {
        first_name: this.first_name,
        last_name: this.last_name,
        role: this.role,
        major: this.major,
        email: this.email
    };
    return returnObject;
};

/** 
 *  Model: Judge
 *
 * Used to store information on judges.
 *
 **/

var Judge = new Schema({
  name: String,
  email: String,
  type: String,
  session: Array,
  presentation: Array
})


  /**
    * Model: LoginToken
    *
    * Used for session persistence.
    */
  LoginToken = new Schema({
    email: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ email: this.email, token: this.token, series: this.series });
    });

  mongoose.model('Proposal', Proposal);
  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);
  mongoose.model('Judge',Judge);

  fn();
}

exports.defineModels = defineModels; 

