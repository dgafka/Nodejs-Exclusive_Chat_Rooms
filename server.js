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
/** Flash support */
var flash 	    = require('connect-flash');

/** The rest of of server configuration */
app.configure(function () {


    //view type
    app.set('view engine', 'ejs');
    // get information from html forms
    app.use(express.json());
    app.use(express.urlencoded());

    app.use(express.methodOverride());
    app.use(express.cookieParser('pasSNoTBreakAb4E')); // read cookies (needed for auth)
    app.use(express.session());
    //Passport configuration
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    //Less compiler
    app.use(less({
        src: path.join(__dirname, 'less'),
        dest: path.join(__dirname, 'public/css'),
        prefix: '/css',
        // force true recompiles on every request... not the
        // best for production, but fine in debug while working
        // through changes
        force: true
    }));

    //views
    app.set('views', __dirname + '/views');

    //client libaries
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

/** Server starts to listen on port 3000 */
server.listen(3000);

/** Events handling in socket.io */
/** on -> getting called when, sockets "emit" an message */
/** emit -> calls "on" on client side */
io.sockets.on('connection', function(socket){
    console.log('Client connected...');

    //Emits a welcome message to client
    socket.emit('messages', { results: 'Connected to chat...' });

    socket.on('messages', function(data) {
        //Broadcast message over all connected sockets, expect the one which sent the message
        socket.broadcast.emit("messages", data);
    })
})