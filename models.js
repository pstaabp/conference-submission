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

 
  var Proposal = new Schema({
    author: String,
    other_authors: Array,
    email: String,
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
    other_equipment: String
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
    role: String,
    major: String,
    email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    hashed_password: String,
    salt: String,
    reset_pass: Boolean,
    temp_pass: String
  });

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });


  User.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  });
  
  User.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  User.method('encryptPassword', function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  });

  User.pre('save', function(next) {
    if (!validatePresenceOf(this.password)) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
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

