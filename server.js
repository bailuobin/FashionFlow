
var express = require('express');
var passport = require('passport')
    , LocalStrategy = require('passport-local');

var passportAPI = require('passport')
    ,FacebookStrategy = require('passport-facebook').Strategy;

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
designItemCollection.ensureIndex( { name: "text" } );
var mostRecentDesignsCollection = db.collection('recent_designs');
//var RelationCollection = db.collection('relationship');

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

passportAPI.use(new FacebookStrategy({
    clientID: "879879865363541",
    clientSecret: "4dbc2569e9e82c70b7baefdf22354805",
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {


    usersCollection.findOne(function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });

    usersCollection.findOne(
      { 'facebook.id' : profile.id }, 
      function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {

                    return done(null, user); // user found, return that user

                } else {

                    // if there is no user found with that facebook id, create them
                    var newUser = {
                      username: profile.id,
                      password: 123456,
                      facebook: { 
                                  id : profile.id, // set the users facebook id 
                                  token : token, // we will save the token that facebook provides to the user  
                                  name : profile.name.givenName + ' ' + profile.name.familyName, // look at the passport user profile to see how names are returned
                                  email : profile.emails[0].value // facebook can return multiple emails so we'll take the first
                                }
                    }

                    usersCollection.insert(
                      newUser, 
                      function (err, doc){
                          return done(null, doc);
                      }
                    );
                    
                }

    });
  
}));

passportAPI.serializeUser(function(user, done) {
  done(null, user);
});

passportAPI.deserializeUser(function(user, done) {
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
        //console.log(doc[i]._id);
        var deadline = new Date(doc[i].dt);
        deadline.setHours(deadline.getHours() + parseInt(doc[i].time_left));

        //console.log(deadline);
        var currentTime = new Date();
        //currentTime.setHours(currentTime.getHours() + 10);
        //console.log(currentTime);
        //console.log(currentTime);
        if(currentTime > deadline){
          //console.log("passed deadline");

          //console.log(doc[i]._id + doc[i].name + ": passed deadline");
          
          var currentWinner = doc[i].current_winner;
          var currentDesigner = doc[i].designer;

          if(currentWinner == undefined){// which means deadline passed but no one bid
              designItemCollection.findAndModify({
                query: { _id: mongojs.ObjectId(doc[i]._id) },
                update: { $set: { status: "NO_ONE_BID"} },
                new: true
              });

              usersCollection.update(
               { _id: mongojs.ObjectId(currentDesigner)},
               { $pull: { selling_designs: doc[i]._id } },//remove this item from selling list
               { upsert: true}
              );

          }else{
              designItemCollection.findAndModify({
                query: { _id: mongojs.ObjectId(doc[i]._id) },
                update: { $set: { finally_belong_to: currentWinner,
                                  status: "WAIT_FOR_PAYMENT"} },
                new: true
              });

              usersCollection.update(
               { _id: mongojs.ObjectId(currentWinner) },
               { $addToSet: { wait_for_pay_designs: doc[i]._id} },
               { upsert: true}
              );

              usersCollection.update(
               { _id: mongojs.ObjectId(currentWinner)},
               { $pull: { bidding_designs: doc[i]._id } },//remove this item from bidding list
               { upsert: true}
              );

          }



          // designItemCollection.findAndModify({
          //   query: { _id: mongojs.ObjectId(doc[i]._id) },
          //   update: { $set: { finally_belong_to: currentWinner,
          //                     status: "WAIT_FOR_PAYMENT"} },
          //   new: true
          // });

          // usersCollection.update(
          //  { _id: mongojs.ObjectId(currentWinner) },
          //  { $addToSet: { wait_for_pay_designs: doc[i]._id} },
          //  { upsert: true}
          // );

          // usersCollection.update(
          //  { _id: mongojs.ObjectId(currentWinner)},
          //  { $pull: { bidding_designs: doc[i]._id } },//remove this item from bidding list
          //  { upsert: true}
          // );

          // usersCollection.update(
          //  { _id: mongojs.ObjectId(currentDesigner)},
          //  { $pull: { selling_designs: doc[i]._id } },//remove this item from selling list
          //  { upsert: true}
          // );

          

          

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

app.get('/auth/facebook',
        passportAPI.authenticate('facebook', { scope : 'email' })
);

app.get('/auth/facebook/callback',
        passportAPI.authenticate('facebook', {
            successRedirect : '/loginsuccess',
            failureRedirect : '/loginfail'
        }));

app.get("/loginsuccess", function(req, res){
    //res.send("Hello World!");
    res.send("loginSuccess");
});

app.get("/loginfail", function(req, res){
    //res.send("Hello World!");
    res.send("loginFail");
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



app.post("/signup", function (req, res) {
        usersCollection.insert(req.body, function (err, doc) {
          if(err){
            res.send(err);
          }else{
            res.json(doc);
          }
            
        });
    });

app.post("/upload", function (req, res) {
        designItemCollection.insert(req.body, function (err, doc) {
            res.json(doc);

            //Update the recent design clct
            mostRecentDesignsCollection.update(
               { name: "recent_designs"},
               { $addToSet: { designs: doc._id } },
               { upsert: true}
            );

            usersCollection.update(
               { _id: mongojs.ObjectId(req.body.designer)},
               { $addToSet: { selling_designs: req.body._id } },
               { upsert: true}
            );

        });

        

    });

app.get("/load_selling_designs/:id", function (req, res) {
        var id = req.params.id;

        designItemCollection.find({ designer: id },
            function (err, doc) {
                console.log(err);
                res.json(doc);
            });
    });

app.get("/load_design_by_id/:id", function (req, res) {
        var id = req.params.id;

        designItemCollection.findOne(
          { _id: mongojs.ObjectId(id)},
            function (err, doc) {
                if(err){
                  res.send(err);
                }else{
                  res.json(doc);
                }
                
                
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
          console.log(doc);
          res.json(doc);
    });

    usersCollection.update(
       { _id: mongojs.ObjectId(req.body.userId)},
       { $addToSet: { bidding_designs: mongojs.ObjectId(id) } },
       { upsert: true}
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
      function (err, doc){
          if(err){
            res.send(err);
          }else{
            res.json(doc[0].designs);
          }

      });
});

app.get("/load_designs_default", function (req,res){
    designItemCollection.find(
    function(err, doc){
      res.json(doc);
    });
});

app.get("/load_shopcart_data/:id", function (req, res) {
        var user_id = req.params.id;

        //console.log(user_id);

        usersCollection.find(
          { _id: mongojs.ObjectId(user_id)},
          function (err, doc) {
            //console.log(user);
            if(doc.length > 0){
              res.send(doc[0].wait_for_pay_designs);
            }
            
            //res.send(doc[0].selling_designs);
          }
        );

});


app.put("/pay/:id", function (req, res) {
    var id = req.params.id;
    console.log(id);
    if(req.body.action == "confirm"){//change status to sold

        console.log(req.body.action);

        designItemCollection.findAndModify({
            query: { _id: mongojs.ObjectId(id) },
            update: { $set: { status: "SOLD" }},
            new: true
        },
            function (err, doc) {
              //console.log(doc);
              //res.json(doc);
        });

        //console.log("dsadad");
        //console.log(req.body.buyerID);
        //console.log(mongojs.ObjectId(req.body.buyerID));

        usersCollection.update(
           { _id: mongojs.ObjectId(req.body.buyerID)},
           { $addToSet: { bought_designs: mongojs.ObjectId(id) } },//there will be no duplicates
           { upsert: true}
        );

        usersCollection.update(
           { _id: mongojs.ObjectId(req.body.buyerID)},
           { $pull: { wait_for_pay_designs: mongojs.ObjectId(id) } },//remove this item from waiting pay list
           { upsert: true}
        );

        //console.log(mongojs.ObjectId(req.body.designerID));
        usersCollection.update(
           { _id: mongojs.ObjectId(req.body.designerID)},
           { $addToSet: { sold_designs: mongojs.ObjectId(id) } },
           { upsert: true}
        );

        usersCollection.update(
           { _id: mongojs.ObjectId(req.body.designerID)},
           { $pull: { selling_designs: mongojs.ObjectId(id) } },
           { upsert: true}
        );

        res.send("pay success");



    }else{
        // do something here
    }
    

});

app.get("/load_ongoing/:id", function (req, res) {
  var id = req.params.id;  
  usersCollection.find(
   { _id: mongojs.ObjectId(id)},
   function (err, doc){
      //console.log(doc);
      res.json(doc);
   }
  );
});



app.get("/load_search_results/:query", function (req, res) {
  //var query = req.params.query;
  var query = req.params.query;
  console.log("Query is: " + query);

  designItemCollection.find(
    { $text: { $search: query } },
    function(err, docs){
      //console.log(err);
      if(docs != null){
        //console.log(docs[0].name);
        res.json(docs);
      }
    }
  );

});

app.get("/load_results_by_sex/:query", function (req, res) {
  //var query = req.params.query;
  var query = req.params.query;
  console.log("Query is: " + query);

  designItemCollection.find(
    { sex: query },
    function(err, docs){
      //console.log(err);
      if(docs != null){
        //console.log(docs[0].name);
        res.json(docs);
      }
    }
  );

});

app.get("/load_results_by_category/:query", function (req, res) {
  //var query = req.params.query;
  var query = req.params.query;
  console.log("Query is: " + query);

  designItemCollection.find(
    { category: query },
    function(err, docs){
      //console.log(err);
      if(docs != null){
        //console.log(docs[0].name);
        res.json(docs);
      }
    }
  );

});






app.listen(port, ipaddress);