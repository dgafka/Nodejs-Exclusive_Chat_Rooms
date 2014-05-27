module.exports = function (app, passport) {

    /**
     * Route to main page.
     */
    app.get('/', function(req, res) {
        res.render('index.ejs', { message: req.flash('message') });
    })

    /**
     * Route to login in, there you can pick prefered method to authenticate yourself.
     */
    app.get('/login', function(req, res){

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('message') });
    })

    /** Process the login form */
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /**
     * Route to sign up
     */
    app.get('/signup', function(req, res){

        res.render('signup.ejs', { message: req.flash('message')})
    })

    /** Process the signup form */
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /**
     * Route to profile
     */
    app.get('/profile', isLogged, function(req, res){
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('message')
        })
    })

    /**
     * Route to logout actual logged user.
     */
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    })

    /**
     * Route to list of chats
     */
    app.get('/chat', isLogged, function(req, res){
        res.render('chat.ejs', { message: req.flash('message') });
    })

    /**
     * Route to chat room
     */
    app.get('/chat_room', isLogged, function(req, res){
        res.render('chat_room.ejs', { message: req.flash('message') })
    })

    /**
     * Checks, if user is logged, if not redirect to login page.
     * Suddenly can't do it as anonymous function under some variable, because "get", expect it to be normal function.
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    function isLogged(req, res, next) {

        if(req.isAuthenticated()) {
            return next();
        }

        res.redirect('/login');
    }
};