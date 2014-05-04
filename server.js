var express     = require('express');
var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);
var routes = require('./routes');
var path = require('path');
var less = require('less-middleware');

//Configuration
    //client libaries
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));
    app.use(express.static(path.join(__dirname, 'bower_components/bootstrap/dist')));

    //view folder
    app.set('views', __dirname + '/views');
    //view type
    app.set('view engine', 'ejs');
    //Stuff needed for views
    app.use(require('body-parser')());

    //Change secret session, before running the app
    //Stuff need for sessions
    app.use(require('cookie-session')({
        keys: ['secret1', 'secret2']
    }));

    //Less compiler
    app.use(less({
        src: path.join(__dirname, 'less'),
        dest: path.join(__dirname, 'public/css'),
        prefix: '/css',
        compress: true
    }));

app.get('/', routes.index);

//server start listing
server.listen(3000);

//Events handling
io.sockets.on('connection', function(client){
    console.log('Client connected...');

    //Emits a welcome message to client
    client.emit('messages', { results: 'Welcome to chat.' });

    client.on('messages', function(data) {
        client.broadcast.emit("messages", data);
    })
})