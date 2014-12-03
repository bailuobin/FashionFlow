
var express = require('express');
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

var app = express();
var mongojs = require('mongojs');

// default to a 'localhost' configuration:
var mongodbConnectionString = '127.0.0.1:27017/cs5610project';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  mongodbConnectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
var db = mongojs(mongodbConnectionString, ["applications"]);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;


app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());//turn the parser on so that server can read the json from req. body
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

//======Passport part======

passport.use(new LocalStrategy(

  {
    usernameField: 'email',
    passwordField: 'password'
  },

  function(username, password, done) {
    var usersCollection = db.collection('users');
    
    usersCollection.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!(user.password == password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//======End of Passport part======



//=====================================================

app.get("/hello", function(req, res){
    res.send("Hello World!");
});




app.post('/login',
  passport.authenticate('local', { successRedirect: '/hello',
                                   failureRedirect: '/'})
);


/*
//for login route
app.post('/login', function (req, res) {
  var post = req.body;
  if (post.username == 'admin' && post.password == '123456') {
    req.session.user_id = 111111111;
    res.redirect('/hello');
  } else {
    res.send('Bad user/pass');
  }
});
*/





app.listen(port, ipaddress);