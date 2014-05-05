var express     = require('express');
var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);
var routes = require('./routes');
var path = require('path');
var less = require('less-middleware');

//Configuration
app.configure(function () {


    //view folder
    app.set('views', __dirname + '/views');
    //view type
    app.set('view engine', 'ejs');
    //Stuff needed for views && sessions
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('bardzo tajne aqq'));
    app.use(express.session());
    app.use(app.router);

    //Less compiler
    app.use(less({
        src: path.join(__dirname, 'less'),
        dest: path.join(__dirname, 'public/css'),
        compress: true
    }));

    //client libaries
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));
    app.use(express.static(path.join(__dirname, 'bower_components/bootstrap/dist')));

});

app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
});

//routes
app.get('/', routes.index);

//server start listing
server.listen(3000);

//Events handling
io.sockets.on('connection', function(client){
    console.log('Client connected...');

    //Emits a welcome message to client
    client.emit('messages', { results: 'Connected to chat...' });

    client.on('messages', function(data) {
        client.broadcast.emit("messages", data);
    })
})