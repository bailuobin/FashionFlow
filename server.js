
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
var usersCollection = db.collection('users');
usersCollection.ensureIndex( { "username": 1 }, { unique: true } );//make the username field unique
var designItemCollection = db.collection('design_items');
var mostRecentDesignsCollection = db.collection('recent_designs');
var RelationCollection = db.collection('relationship');

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
    //usernameField: 'email',
    //passwordField: 'password'
    passReqToCallback: true
  },

  function(req, username, password, done) {
    var username = req.body.username;
    var password = req.body.password;


    
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




function checkBiddingDeadLine() {
   //email.send(to, headers, body);
   //console.log(new Date());
  designItemCollection.find(function(err, doc){
    for(i = 0; i < doc.length; i++){
      //console.log(doc[i].dt);
      if(doc[i].status == "ON_GOING"){
        deadline = new Date(doc[i].dt);
        //console.log(deadline);
        currentTime = new Date();

        if(currentTime > deadline){
          //console.log(doc[i]._id + doc[i].name + ": passed deadline");
          //modify this design item to a passed deadline status
          
          var currentWinner = doc[i].current_winner;
          //console.log(currentWinner);

          designItemCollection.findAndModify({
            query: { _id: mongojs.ObjectId(doc[i]._id) },
            update: { $set: { finally_belong_to: currentWinner,
                              status: "WAIT_FOR_PAYMENT"} },
            new: true
          });



          

        }else{
          //console.log(doc[i]._id + doc[i].name + ": still ongoing");
        }
        
      }
      
    }

  });
}


 
setInterval(checkBiddingDeadLine, 1*1000);




app.get("/get_current_user", function(req, res){
    res.send(req.user);
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/loginsuccess',
                                   failureRedirect: '/'})
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get("/loginsuccess", function(req, res){
    //res.send("Hello World!");
    res.send("loginSuccess");
});

app.post("/signup", function (req, res) {
        usersCollection.insert(req.body, function (err, doc) {
            res.json(doc);
        });
    });

app.post("/upload", function (req, res) {
        designItemCollection.insert(req.body, function (err, doc) {
            res.json(doc);

            //Update the recent design clct
            mostRecentDesignsCollection.update(
               { name: "recent_designs"},
               { $addToSet: { designs: doc._id } },
               { upsert: true},
               function (){

               }
            );

        });

        RelationCollection.update(
           { user_id: req.body.designer},
           { $addToSet: { selling_designs: req.body._id } },
           { upsert: true},
           function (err, doc){
              console.log(doc);
           }
        );

    });

app.get("/load_selling_designs/:id", function (req, res) {
        var id = req.params.id;

        designItemCollection.find({ designer: id },
            function (err, doc) {
                console.log(err);
                res.json(doc);
            });
    });

app.get("/load_current_design/:id", function (req, res) {
        var id = req.params.id;

        designItemCollection.findOne({ _id: mongojs.ObjectId(id)},
            function (err, doc) {
                console.log(err);
                res.json(doc);
            });
    });

app.put("/bid/:design_id", function (req, res) {
    var id = req.params.design_id;
    //console.log(id);

    designItemCollection.findAndModify({
        query: { _id: mongojs.ObjectId(id) },
        update: { $set: { former_min: req.body.currentMin,
                          min_price: req.body.yourBid,
                          current_winner: req.body.userId } },
        new: true
    },
        function (err, doc) {
            res.json(doc);
    });

    RelationCollection.update(
       { user_id: req.body.userId},
       { $addToSet: { bidding_designs: id } },
       { upsert: true},
       function (){
       }
    );

});


app.get("/get_username/:id", function (req, res) {
        var id = req.params.id;

        usersCollection.findOne({ _id: mongojs.ObjectId(id)},
            function (err, user) {
                console.log(err);
                res.send(user.username);
            });
    });


app.get("/load_recent_designs", function (req, res) {

    mostRecentDesignsCollection.find(
      {name : "recent_designs"}, 
      function(err, doc){

          res.json(doc[0].designs);

      });
});

app.get("/load_designs_default", function (req,res){
    designItemCollection.find(
    function(err, doc){
      res.json(doc);
    });
});


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