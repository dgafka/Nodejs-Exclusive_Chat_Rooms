//*******************************
//
// Initalization of necessary modules
//
//*******************************
/** Express application */
var express     = require('express');
/** Server configuration (express + http + socket.io) */
var app = express()
    /** http module */
    , http      = require('http')
    /** creates express application using http */
    , server    = http.createServer(app)
    /** hook socket.io to an http server */
    , io        = require('socket.io').listen(server);
/** Passport for authorization  */
var passport       = require('passport');
/** Handles joining path (to libaries for example) to use them in application */
var path        = require('path');
/** Less compiler */
var less        = require('less-middleware');
/** Session Flash support */
var flash 	    = require('connect-flash');

//Session configs
/** Needed for sessions in socket.io */
var passportSocketIo = require('passport.socketio');
var sessionStore = new express.session.MemoryStore();
/** Secret for parsing session cookie */
var sessionSecret = 'secrect_service_666';
/** Name of the cookies where express stores his session */
var sessionKey = 'connect.sid';

//*******************************
//
// Configuration of server
//
//*******************************
app.configure(function () {

    var engine = require('ejs-locals-improved');
    /** use ejs-locals for all ejs templates */
    app.engine('ejs', engine);
    /** view engine ejs for templates */
    app.set('view engine', 'ejs');

    /** get information from html forms */
    app.use(express.json());
    app.use(express.urlencoded());

    app.use(express.methodOverride());
    app.use(express.cookieParser('pasSNoTBreakAb4E')); // read cookies (needed for auth)
    app.use(express.session({
        store: sessionStore,
        key: sessionKey,
        secret: sessionSecret
    }));
    //Passport configuration
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    /**
     * Less compiler, should compile every time server is restarted.
     * @TODO doesn't compile less.
     */
    app.use(less({
        src: path.join(__dirname, 'less'),
        dest: path.join(__dirname, 'public/css'),
        prefix: '/css',
        // force true recompiles on every request... not the
        // best for production, but fine in debug while working
        // through changes
        force: true
    }));

    /** Add view to serve them for client easly */
    app.set('views', __dirname + '/views');

    /**
     * Helps to handle request via routes, before serving static files.
     * Ip app.router would be placed after "client libaries", application would search for static files under the route first
     * which is optimalization fail.
     */
    app.use(app.router);

    /** Serve client libaries */
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));
    app.use(express.static(path.join(__dirname, 'bower_components/bootstrap/dist')));

});

/** Error handling */
app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
});

/** Routes handler */
var routes      = require('./routes/routes')(app, passport);

/** Passport configuration */
require('./modules/passport')(passport);


//*******************************
//
// Socket.io authorization access to connect to the server via websockets
//
//*******************************

var onAuthorizeSuccess = function (data, accept) {
    console.log('Authorized access to socket.io');
    accept(null, true);
};

var onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('Unauthorized access to socket.io:', message);
    accept(null, false);
};

io.set('authorization', passportSocketIo.authorize({
    passport: passport,
    cookieParser: express.cookieParser,
    key: sessionKey,
    secret: sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

//*******************************
//
// Socket.io authorization ends
//
//*******************************

/** Server starts to listen on port 3000 */
server.listen(3000, function() {
    console.log("Server has been started at port 3000");
});

//*******************************
//
// Socket.io events handling
//
//*******************************
var socketManagment = require('./modules/Socket');
var socketManagmentClass = new socketManagment(io.sockets);
