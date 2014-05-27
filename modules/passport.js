// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var userController = require('./../modules/UserController');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(email, done) {
        var usr = new userController();
        usr.findUserByEmail(email, function(obj){
            done(null, obj);
        })
    });

//    Comment upper code and uncomment this one, if authorization fails
//    passport.serializeUser(function (user, done) {
//        done(null, user);
//    });
//
//    passport.deserializeUser(function (obj, done) {
//        done(null, obj);
//    });


    /**
     * Local-signup is strategy for registration new user
     * It looks up in database (redis), for existing email, if
     * email doesn't exist it creates new user.
     */
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            /**
             * process.nextTick delegates method to the end of this loop queue, to be sure, everything
             * will be loaded before starting the function.
             */
            process.nextTick(function() {

                var usr = new userController();
                usr.findUserByEmail(email, function(obj){
                    if(obj) {
                        return done(null, false, req.flash('message', 'Email already taken. Pick another one.'));
                    }
                    var user = usr.addUser(email, password);
                    return done(null, user);

                })

            });

        }));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done){

        process.nextTick(function() {
            var usr = new userController();
            usr.findUserByEmailPassword(email, password, function(obj) {
                if(obj == false) {
                    return done(null, false, req.flash('message', 'Wrong email / password. Try again.'))
                }

                /** Succesfully logged in */
                return done(null, obj)
            })
        })
    }))

};