/*global lang*/
var express = require("express"),
    obj = require("./public/libs/lang.en.js"), //lang
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    multer = require('multer'),
    fs = require('fs'),
    https = require('https'),
    passport = require('passport'),
    expressSession = require('express-session'),
    bCrypt = require('bcrypt-nodejs');
var app = express();

// configure passport
app.use(expressSession({
    secret: 'mySecretKey'
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        console.log(file);
            if (file == null) {
                callback("No file uploaded", null);
                return;
            }
            console.log(file);
            console.log(file.originalname.slice(file.originalname.indexOf(".")+1));
            if (file.originalname.slice(file.originalname.indexOf(".")+1) != "ejs"){
                callback("El fichero debe tener extension '.ejs'", null);
                return;
            }
            //callback(null, file.fieldname + '-' + Date.now());
            if (req.user.role != "admin"){
                callback(null, req.user.username + "__" + file.originalname);
            } else{
                //callback("errrrror", null);
                callback(null, file.originalname);
            }
    }
});

var upload = multer({
    storage: storage
}).single('userPhoto');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//app.set("view engine", "ejs");
//app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.engine('html', require('ejs').renderFile); //html??? working anyway


app.use(express.static("public"));

var User = require("./models/user");
var Submission = require("./models/submission");
var UserScore = require("./models/userscore");
var Challenge = require("./models/challenge");
mongoose.connect('mongodb://localhost/prueba');

app.get('favicon.ico', function(req, res) {
    res.end();
});

// passport
var LocalStrategy = require('passport-local').Strategy;

// passport/login.js
passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
    function(req, username, password, done) {
        // check in mongo if a user with username exists or not
        User.findOne({
                'username': username
            },
            function(err, user) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log error & redirect back
                if (!user) {
                    console.log('User Not Found with username ' + username);
                    return done(null, false,
                        req.flash('message', 'User Not found.'));
                }
                // User exists but wrong password, log the error 
                if (!isValidPassword(user, password)) {
                    console.log('Invalid Password');
                    return done(null, false,
                        req.flash('message', 'Invalid Password'));
                }
                // User and password both match, return user from 
                // done method which will be treated like success
                return done(null, user);
            }
        );
    }));

//signup
passport.use('signup', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        var findOrCreateUser = function() {
            // find a user in Mongo with provided username
            User.findOne({
                'username': username
            }, function(err, user) {
                // In case of any error, return using the done method
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: ' + username);
                    return done(null, false, req.flash('message', 'User Already Exists'));
                }
                else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.username = username;
                    newUser.password = createHash(password);
                    newUser.email = req.param('email');
                    newUser.firstName = req.param('firstName');
                    newUser.lastName = req.param('lastName');
                    if (username == "admin")
                        newUser.role = "admin";
                    else
                        newUser.role = "student";

                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        }
                        console.log('User Registration succesful');
                        return done(null, newUser);
                    });
                }
            });
        };
        // Delay the execution of findOrCreateUser and execute the method
        // in the next tick of the event loop
        process.nextTick(findOrCreateUser);
    }));

// user loggin routes ---------------------------------------------------------
/* GET login page. */
app.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('index.jade', {
        message: req.flash('message')
    });
});

/* Handle Login POST */
app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

/* GET Registration Page */
app.get('/signup', function(req, res) {
    res.render('register.jade', {
        message: req.flash('message')
    });
});

/* Handle Registration POST */
app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

/* Handle Logout */ /*this soulb be post*/
app.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

/* Handle Logout */ 
app.post('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});


// forgotten password

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.flash('message', lang.ui.MUST_LOG_IN)    
    res.redirect('/');
}
var isAuthenticatedJson = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    var response = {"response_status" : "fail", "respone_detail": "Usuario no autenticado"};
    res.type('application/json').status(401).send(response);
}

var isAdmin = function (req, res, next){
    if (req.isAuthenticated() && req.user.role == "admin"){
        return next();
    }
    res.status(403).send(lang.ui.NO_PERMISSION);
}

var isOwnerOrAdmin = function (req, res, next){
    if (req.isAuthenticated() && ( req.user.role == "admin" || req.user.username == req.params.user)){
        return next();
    }
    res.status(403).send("No tienes permiso para acceder a este recurso");
}


/* GET Home Page for users*/
app.get('/home', isAuthenticated, function(req, res) {
    if (req.user.role == "admin"){
        res.redirect("/admin-home");
        return;
    }
    res.render('home.ejs', {
        user: req.user,
        lang: lang
    });
});

/* GET Home Page for admin*/
app.get('/admin-home', isAdmin, function(req, res) {
console.log("admin-home");
    res.render('home.ejs', {   // TODO create and use admin-home.ejs --------------------------------------------------------
        user: req.user
    });
});

// Generates hash using bCrypt
var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(user, password) {
    return bCrypt.compareSync(password, user.password);
}

//TODO que el cliente pida siempre el last, pero el servidor devualva vacio si no existe?

app.get("/challenges/:challenge", isAuthenticated, function(req, res) {
    var network = {nodes: [], links: []};
    //    if (req.params.challenge == 'favicon.ico') res.end();
    //    else{
    console.log("req.params.challenge = " + req.params.challenge);
    
    res.render("challenge.ejs", {
        lang: lang,
        challenge_filename: '../uploads/' + req.params.challenge,
        help_filename: 'partials/' + lang.settings.HELP_FILENAME,
        challenge_id: req.params.challenge,
        user: req.user,
        submission_url: "/submissions/challenges/" + req.params.challenge + "/user/" + req.user.username + "/last"
//        challenge: '../views/challenges/' + req.params.challenge
    });
    return;

    UserScore.findOne({"challenge_id": req.params.challenge, "username": req.user.username}, function(err, userscore) {
        if (err) {
            console.log ("Error retrieving userscore of " + req.user.username + " for challenge_id = " + req.params.challenge + " while loading challenge:");
            console.log(err)
            res.send(err);
            return;
        }
        
        if (userscore != null) {
            Submission.findOne({"_id": userscore.last}, function(err, submission) {
                if (err){
                  console.log ("Error retrieving last submission of " + req.user.username + "for challenge_id = " + req.params.challenge + " while loading challenge:"); 
                  console.log(err);
                  res.send(err);
                  return;
                } 
               
                console.log("encontrado usuario y last")
                network = submission.network;
                nodeReapair(network.nodes);
                console.log(network);
               
                res.render("challenge.ejs", {
                    lang: lang,
                    challenge_filename: '../uploads/' + req.params.challenge,
                    challenge_id: req.params.challenge,
                    user: req.user,
        //            submission_url: "/submissions/challenges/" + req.params.challenge + "/user/" + req.user.username + "/last"
        //        challenge: '../views/challenges/' + req.params.challenge
                });
            });
        } else {
            res.render("challenge.ejs", {
                lang: lang,
                challenge_filename: '../uploads/' + req.params.challenge,
                challenge_id: req.params.challenge,
                user: req.user,
//                submission_url: ""
//                submission_url: "/submissions/challenges/"cuestion2_/user/admin/plast
            });
        }    
        
    });

    //    }
});


app.post('/upload', isAuthenticated, function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.send(err + "");
        }
        if (req.file == null) {
            console.log("No file written");
            return res.send("No file was uploaded");
        }
        if (req.body == null){
            console.log("No file written. Need description and title in form");
            return res.send("No file was uploaded. Nedd description and title in form");
        }
        var challenge = new Challenge;
        challenge.user = req.user.username;
        challenge.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;;
        challenge.date = new Date();
        challenge.path = req.file.path;
        challenge.challenge_id = req.file.filename.slice(0, req.file.filename.indexOf("."));
        challenge.title = req.body.title;
        challenge.description = req.body.description;
        if ("challenge_group" in req.body) 
            challenge.challenge_group = req.body.challenge_group;
        else
            challenge.challenge_group = req.user.username;
console.log(challenge)            
        challenge.save();
        req.user.challenges.push(challenge);
        req.user.save();
        console.log(req.file)
        res.send("File is uploaded");
    });

});

// monitor users submissions
app.get("/monitor/users", isAdmin, function(req, res) {
    
    User.find({}).populate('scores').exec(function(err, users){
        if (err) {
                console.log("Error populating users");
                console.log(err);
                res.send(err);
            }
            
        //console.log("User List data: %j", users[2]);    
    //User.find({}).exec(function(err, users){    
        User.populate(users.scores, {"path": "submissions", "select":"user"}, function (err, data){
            if (err) {
                console.log("Error populating userscores");
                console.log(err);
                res.send(err);
                return;
            }

            //console.log("User List data: %j", users[2]);
            res.render("monitor.ejs", {
                "users": users
            });

//            res.send();
            
        });
    });
        
});

app.get("/monitor/users/:user", isAdmin, function(req, res) {
    User.findOne({"username": req.user}).populate('scores').exec(function(err, user){
        if (err) {
                console.log("Error populating user " + req.params.user );
                console.log(err);
                res.send(err);
            }
            
        //console.log("User List data: %j", users[2]);    
    //User.find({}).exec(function(err, users){    
        User.populate(user.scores, {"path": "submissions", "select":"user"}, function (err, data){
            if (err) {
                console.log("Error populating userscores for " + req.params.user);
                console.log(err);
                res.send(err);
                return;
            }

            //console.log("User List data: %j", users[2]);
            res.render("monitor_user.ejs", {
                "user": user
            });

//            res.send();
            
        });
    });
});

app.post('/monitor/users/:user/pwd', isAdmin, function(req, res) {
    if (req.body.password == null || req.body.password === "") {
        res.send("Cannot set empty password");
        return;
    }

    if (req.body.verify_password == null || req.body.password !== req.body.verify_password) {
        res.send("Password mismatch");
        return;
    }
    
    User.findOne({"username": req.params.user}, function(err, user) {
       if (err){
           console.log("Error trying to change password to user " + req.params.user);
           console.log(err);
           res.send(err);
           return;
       }    
       user.password = createHash(req.body.password);
       user.save();
       res.send("password changed");
       //req.flash('message', 'User Not found.'));
       
    });
});

// TODO check for admin? 
// temporary?
app.get("/challenges/:challenge_id/submissions/:subm_id", isAdmin, function(req, res) {
console.log("get de submissions/id")    
    res.render("challenge-viewer.ejs", {
        "subm_id": req.params.subm_id,
        "challenge_id": req.params.challenge_id,
        "set_teacher_mode": true,
        "user": req.user
        
    });
});

// download file with network grpah
app.get("/challenges/:challenge_id/:user/:last_or_best/network", isAuthenticated, function (req, res) {
    console.log(req.user);
    console.log({"username": req.user.username, "challenge_id": req.params.challenge_id})
    if (req.params.last_or_best != "last" && req.params.last_or_best != "best"){
        res.status(404).send("Recurso no encontrado");
        return;
    }
    UserScore.findOne({"username": req.params.user, "challenge_id": req.params.challenge_id}, function(err, userscore) {
       if (err) {
           console.log("Error donwloading network (retrieving userscore) file for challenge_id " + req.params.challenge_id + ", user = " +req.user );
           console.log(err);
           res.status(500).send(err);
           return;
       } 
       // not a submission from this user or not role = admin 
       if ((req.params.user != req.user.username) && (!("role" in req.user) || req.user.role != "admin")){
           res.status(403).send("No tienes permiso para acceder a este recurso");
           return;
       }
        
       if (userscore == null){
           res.status(400).send("No has enviado ninguna red para evaluar"); // check error code
           return;
       } else{
console.log("buscando submission:")
            console.log(userscore.last)
           Submission.findOne({"_id": (req.params.last_or_best=="last")?userscore.last:userscore.best}, function (err, submission){
               if (err){
                   console.log("Error donwloading network file for challenge_id ");
                   res.status(500).send(err);
               } else{
                   var network = submission.network; 
                   res.set("Content-Disposition", 'attachment;filename="network.json"').type("application/json").send(JSON.stringify(network));
               }
           });
               
           
       }
    });
    /*Submission.findOne({"user": req.user, "challenge_id": req.params.challenge_id, })*/
});

app.get("/submissions/:subm_id", isOwnerOrAdmin, function(req, res) {
    Submission.findOne({"_id": req.params.subm_id}, function(err, submission) {
        if (err) {
            console.log("Error getting submission " + req.params.subm_id);
            console.log(err);
            res.status(500).send(err);
            return;
        }
        res.status(200).type("application/json").send(JSON.stringify(submission));
    })
});

app.get("/submissions/challenges/:challenge_id/user/:user/:num_submission", isOwnerOrAdmin, function(req, res) {
    var num_submission = req.params.num_submission;
    if (num_submission != "first" && num_submission != "last" && num_submission != "best" && !isNaN(num_submission)){
        Submission.findOne({"num_submission": num_submission,  "challenge_id": req.params.challenge_id, "user": req.params.user}, function(err, submission) {
            if (err){
                console.log("Error retrieving submission %s from user %s at challenge %s", num_submission, req.params.user, req.params.challenge_id);
                console.log(err);
                res.status(500).send(err);
                return;
            }
            res.status(200).type("application/json").send(JSON.stringify(submission));
            return;
        })
    } else { // best, last or first
        UserScore.findOne({"challenge_id": req.params.challenge_id, "username": req.params.user}, function(err, userscore) {
            if (err) {
                console.log("Error retrieving userscore for user %s, challenge %s", req.params.user, req.params.challenge_id);
                console.log("error");
                res.status(500).send(err);
                return;
            }
            if (userscore == null){
                console.log("Not found usercore for user %s, challenge %s", req.params.user, req.params.challenge_id);
                res.status(404).send("No submissions found for specified user and challenge");
                return;
            }
            var subm_id = "";
            if (num_submission === "best") subm_id = userscore.best;
            else if (num_submission === "last") subm_id = userscore.last;
            else if (num_submission === "first") subm_id = userscore.first;
            else {
                console.log("Specified resource not found");
                res.status(404).send("Specified resource not found: " + req.baseUrl);
                return;
            }
            Submission.findOne({"_id": subm_id}, function(err, submission) {
                if (err) {
                    console.log("Error getting submission " + req.params.subm_id);
                    console.log(err);
                    res.status(500).send(err);
                    return;
                }
                res.status(200).type("application/json").send(JSON.stringify(submission));
            });
            
        });
    }
    
})

app.post('/submissions', isAuthenticatedJson, function(req, res) {
    //console.log(req.body);
    var submission = req.body;
    submission.user = req.user.username;
    submission.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;;
    submission.date = new Date();
    //submission.challenge_id = ///////////////////////////////////////////////////////////////////////////// 
    
    Submission.create(submission, function (err, created_submission){
       if (err){
           console.log("Error creating submission:");
           console.log(err);
           res.type('application/json').status(400).send(err);
           return;
       } else {
//           console.log("submission created:");
//           console.log(created_submission);
//console.log("Se va a buscar:")
//console.log({"challenge_id": created_submission.challenge_id, "username": created_submission.user});
           UserScore.findOne({"challenge_id": created_submission.challenge_id, "username": created_submission.user}, function (err, userscore){
               if(err){
                    console.log("Error creating userscore (checking if exists):" + err);
                    res.type('application/json').status(400).send(err);
                    return;
               } else{
//                 console.log("userscore encontrado:")
//                 console.log(userscore)
                   var is_new = false;
                    if (userscore == null){
                        userscore = new UserScore;
                        userscore.username = req.user.username;
                        userscore.num_attemps = 0;
                        userscore.score = 0;
                        userscore.challenge_id = created_submission.challenge_id;
                        userscore.best = created_submission._id;
                        userscore.submissions = [];
                        userscore.scores = [];
                        userscore.ok_after_attemps = 0;
                        userscore.first = created_submission._id;
                        is_new = true;
                    }
                    //delete userscore.__v;

                    userscore.last = created_submission._id;
                    userscore.ip = created_submission.ip;
                    userscore.date = created_submission.date;
                    if (created_submission.score >= 9.9 && userscore.score <9.9) userscore.ok_after_attemps = userscore.num_attemps;
                    if (created_submission.score > userscore.score){
                        userscore.score = created_submission.score;
                        userscore.best = created_submission._id;
                    }
                    userscore.num_attemps++;
                    created_submission.num_submission = userscore.num_attemps;
                    
                    created_submission.save();
                    userscore.submissions.push(created_submission._id);
//console.log("usercore:")
//console.log(userscore)
                    userscore.save();
                    if (is_new) {
                        req.user.scores.push(userscore);
                        req.user.save();
                    }
                    
//var fields = {"num_attemps":1, "score":1, "last": 1, "best":1, "challenge_id": 1};
//                    UserScore.findOneAndUpdate({"challenge_id": created_submission.challenge_id, "username": created_submission.username}, userscore, {"upsert":true}, function(err, doc){
/*                    UserScore.findOne({"challenge_id": created_submission.challenge_id, "username": created_submission.username}, userscore, {"upsert":true}, function(err, doc){
                        if (err) {
                            console.log("Error creating userscore:" + err);
                            res.type('application/json').status(400).send(err);
                        } else {
                           var response = {"response_status" : "success", "respone_detail": "Network submitted"};
                           res.location('/submissions/'+created_submission._id).status(201);
                           res.send(JSON.stringify(response));
                            
                        }
                    });
*/                    
var response = {"response_status" : "success", "respone_detail": "Network submitted"};
                           res.location('/submissions/'+created_submission._id).status(201);
                           res.send(JSON.stringify(response));
                    
               }
           });
       }
    });




/*    console.log("req.body");
    console.log(req.body);
    //    console.log("isAuthenticated()");
    //    console.log(isAuthenticated());
    console.log("req.user");
    console.log(req.user);
*/    
//    res.send(req.body);

});

// fix, changes tw-pow attribute for tx-pow(dBm)
// delete function in the future
var nodeReapair = function (nodes){
    if (nodes != null){
        nodes.forEach(function (n){
            if ("tx-pow" in n) {
                n["tx-pow(dBm)"] = n["tx-pow"];
                delete n["tx-pow"];
                console.log("arreglado nodo " + n.id);
            }
        });
    
    }
}

// c9.io does not support my own certificates/HTTPS, check in local later
/*https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: "hola_1234"
}, app).listen(process.env.PORT, process.env.IP, 10, function (){console.log("App running"); });*/
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("App running");
});