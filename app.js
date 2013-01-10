
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

// connect to Mongo when the app initializes
mongoose.connect('mongodb://localhost:27017/test');
//mongoose.set('debug',true);
console.log("Connecting to mongodb, port 27017");

mongoose.connection.on('error', function(err){console.log("err: " + err)});

var Schema = mongoose.Schema; 

require('./models/server/ProposalSchema.js').make(Schema, mongoose);


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
 // app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);

 // app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});



//app.get('/', routes.index);
//app.get('/users', user.list);

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

app.get('/about', function(req, res){
  res.json({title: "about"});
  //res.render('about', {  title: 'About'});
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

app.post('/test-page', function(req, res) {
    var _name = req.body.name,
        _size = req.body.size,
        test = new tank({name: _name, size: _size});
        console.log("test: " + test);

    test.save(function(err) {
      if(err) {
        console.log(err.message);
      } else {
        console.log('saved test : ' +  test);

        tank.find({name: "blue"}, function(err, docs){
          if(err){
            console.log("error: " + err)
          } else{
            console.log(docs.length);
          }
        });
      } 
          
     });   

//    console.log("name: " + _name + "  size: " + _size);

    res.json({title: "yeah"});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
